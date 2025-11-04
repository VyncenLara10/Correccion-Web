import random
import string
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

class ZerobounceSendEmailService:
    """Servicio para verificar emails con Zerobounce y enviar códigos de verificación"""
    
    def __init__(self):
        self.zerobounce_api = settings.ZEROBOUNCE_API_KEY
        self.zerobounce_url = "https://api.zerobounce.net/v2/validate"
        self.smtp_server = settings.EMAIL_HOST
        self.smtp_port = settings.EMAIL_PORT
        self.sender_email = settings.EMAIL_HOST_USER
        self.sender_password = settings.EMAIL_HOST_PASSWORD
    
    @staticmethod
    def generate_verification_code():
        """Genera un código de verificación de 6 dígitos"""
        return ''.join(random.choices(string.digits, k=6))
    
    def validate_email_with_zerobounce(self, email):
        """
        Valida que el email sea válido usando la API de Zerobounce
        
        Args:
            email (str): Email a validar
            
        Returns:
            dict: {
                'valid': bool,
                'status': str,  # 'valid', 'invalid', 'do_not_mail', 'spamtrap', 'abuse', 'unknown'
                'message': str
            }
        """
        try:
            params = {
                'email': email,
                'api_key': self.zerobounce_api,
                'ip_address': ''
            }
            
            response = requests.get(self.zerobounce_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                
                # Validar que el email sea válido según Zerobounce
                if status == 'valid':
                    return {
                        'valid': True,
                        'status': status,
                        'message': 'Email válido'
                    }
                else:
                    return {
                        'valid': False,
                        'status': status,
                        'message': f'Email inválido: {status}'
                    }
            else:
                logger.error(f"Error al validar email con Zerobounce: {response.status_code}")
                return {
                    'valid': False,
                    'status': 'error',
                    'message': 'Error al validar el email'
                }
        except requests.RequestException as e:
            logger.error(f"Error de conexión con Zerobounce: {str(e)}")
            return {
                'valid': False,
                'status': 'error',
                'message': 'Error de conexión con el servicio de validación'
            }
        except Exception as e:
            logger.error(f"Error inesperado en validación de email: {str(e)}")
            return {
                'valid': False,
                'status': 'error',
                'message': 'Error inesperado'
            }
    
    def send_verification_email(self, email, verification_code):
        """
        Envía el código de verificación por email
        
        Args:
            email (str): Email del destinatario
            verification_code (str): Código de 6 dígitos
            
        Returns:
            dict: {
                'success': bool,
                'message': str
            }
        """
        try:
            # Crear mensaje HTML elegante
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 24px;
                    }}
                    .content {{
                        padding: 40px 30px;
                        text-align: center;
                    }}
                    .code-box {{
                        background-color: #f9f9f9;
                        border: 2px dashed #667eea;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 30px 0;
                    }}
                    .verification-code {{
                        font-size: 36px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 5px;
                        font-family: 'Courier New', monospace;
                    }}
                    .message {{
                        color: #666;
                        font-size: 14px;
                        line-height: 1.6;
                    }}
                    .expiration {{
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin-top: 20px;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #856404;
                    }}
                    .footer {{
                        background-color: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #999;
                        border-top: 1px solid #e0e0e0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Verificación de Correo Electrónico</h1>
                    </div>
                    <div class="content">
                        <p class="message">Hola,</p>
                        <p class="message">
                            Te enviamos un código de verificación para completar tu registro en <strong>TikalInvest</strong>.
                        </p>
                        <div class="code-box">
                            <p class="message" style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Tu código de verificación:</p>
                            <div class="verification-code">{verification_code}</div>
                        </div>
                        <p class="message">
                            Ingresa este código en la pantalla de verificación para continuar con tu registro.
                        </p>
                        <div class="expiration">
                            ⏰ Este código expirará en 15 minutos. No compartas este código con nadie.
                        </div>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">© 2025 TikalInvest. Todos los derechos reservados.</p>
                        <p style="margin: 5px 0 0 0;">Si no solicitaste este código, ignora este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Crear mensaje
            message = MIMEMultipart('alternative')
            message['Subject'] = "🔐 Verifica tu correo en TikalInvest"
            message['From'] = self.sender_email
            message['To'] = email
            
            # Agregar versión de texto plano como fallback
            text_content = f"Tu código de verificación: {verification_code}\n\nEste código expirará en 15 minutos."
            message.attach(MIMEText(text_content, 'plain'))
            message.attach(MIMEText(html_content, 'html'))
            
            # Enviar email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            logger.info(f"Código de verificación enviado a {email}")
            return {
                'success': True,
                'message': 'Código enviado exitosamente'
            }
            
        except smtplib.SMTPAuthenticationError:
            logger.error("Error de autenticación SMTP")
            return {
                'success': False,
                'message': 'Error al enviar el correo (autenticación fallida)'
            }
        except smtplib.SMTPException as e:
            logger.error(f"Error SMTP: {str(e)}")
            return {
                'success': False,
                'message': 'Error al enviar el correo'
            }
        except Exception as e:
            logger.error(f"Error inesperado al enviar email: {str(e)}")
            return {
                'success': False,
                'message': 'Error inesperado al enviar el correo'
            }
    
    def save_verification_code(self, email, code):
        """
        Guarda el código de verificación en la base de datos
        
        Args:
            email (str): Email del usuario
            code (str): Código de verificación
            
        Returns:
            EmailVerificationCode: Objeto guardado
        """
        from apps.users.models import EmailVerificationCode
        
        # Eliminar códigos anteriores expirados del mismo email
        EmailVerificationCode.objects.filter(
            email=email,
            is_verified=False,
            expires_at__lt=timezone.now()
        ).delete()
        
        # Crear nuevo código
        expires_at = timezone.now() + timedelta(minutes=15)
        verification_code = EmailVerificationCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at
        )
        return verification_code
    
    def verify_code(self, email, code):
        """
        Verifica que el código sea correcto
        
        Args:
            email (str): Email del usuario
            code (str): Código a verificar
            
        Returns:
            dict: {
                'valid': bool,
                'message': str,
                'verification_code': EmailVerificationCode object (si es válido)
            }
        """
        from apps.users.models import EmailVerificationCode
        
        try:
            verification_code = EmailVerificationCode.objects.get(
                email=email,
                code=code
            )
            
            # Incrementar intentos
            verification_code.attempts += 1
            verification_code.save()
            
            # Validar código
            if verification_code.is_expired():
                return {
                    'valid': False,
                    'message': 'El código ha expirado. Solicita uno nuevo.'
                }
            
            if verification_code.is_verified:
                return {
                    'valid': False,
                    'message': 'Este código ya ha sido utilizado.'
                }
            
            if verification_code.attempts > 5:
                return {
                    'valid': False,
                    'message': 'Demasiados intentos fallidos. Solicita un nuevo código.'
                }
            
            # Marcar como verificado
            verification_code.is_verified = True
            verification_code.save()
            
            return {
                'valid': True,
                'message': 'Código verificado exitosamente',
                'verification_code': verification_code
            }
            
        except EmailVerificationCode.DoesNotExist:
            return {
                'valid': False,
                'message': 'Código inválido.'
            }
        except Exception as e:
            logger.error(f"Error al verificar código: {str(e)}")
            return {
                'valid': False,
                'message': 'Error al verificar el código'
            }
    
    def send_report_code_email(self, email, report_code, user_name):
        """
        Envía el código de reporte por email
        
        Args:
            email (str): Email del destinatario
            report_code (str): Código único de 6 dígitos para el reporte
            user_name (str): Nombre del usuario
            
        Returns:
            dict: {
                'success': bool,
                'message': str
            }
        """
        try:
            # Crear mensaje HTML elegante para código de reporte
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 24px;
                    }}
                    .content {{
                        padding: 40px 30px;
                        text-align: center;
                    }}
                    .code-box {{
                        background-color: #f9f9f9;
                        border: 2px dashed #667eea;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 30px 0;
                    }}
                    .report-code {{
                        font-size: 36px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 5px;
                        font-family: 'Courier New', monospace;
                    }}
                    .message {{
                        color: #666;
                        font-size: 14px;
                        line-height: 1.6;
                    }}
                    .expiration {{
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin-top: 20px;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #856404;
                    }}
                    .footer {{
                        background-color: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #999;
                        border-top: 1px solid #e0e0e0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Código de Reporte</h1>
                    </div>
                    <div class="content">
                        <p class="message">Hola {user_name},</p>
                        <p class="message">
                            Solicitaste un reporte en TikalInvest. Usa el siguiente código para completar tu solicitud.
                        </p>
                        <div class="code-box">
                            <p class="message" style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Tu código de reporte:</p>
                            <div class="report-code">{report_code}</div>
                        </div>
                        <p class="message">
                            Ingresa este código en la pantalla de verificación para que te enviemos el reporte en formato PDF.
                        </p>
                        <div class="expiration">
                            ⏰ Este código expirará en 24 horas. No compartas este código con nadie.
                        </div>
                        <p class="message" style="margin-top: 20px;">
                            Si no solicitaste este reporte, puedes ignorar este email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2025 TikalInvest. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Crear y enviar email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Código de Reporte - TikalInvest"
            msg['From'] = self.sender_email
            msg['To'] = email
            
            # Parte de texto plano
            text_content = f"Tu código de reporte es: {report_code}\nExpira en 24 horas."
            msg.attach(MIMEText(text_content, 'plain'))
            
            # Parte HTML
            msg.attach(MIMEText(html_content, 'html'))
            
            # Enviar
            server = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✓ Código de reporte enviado a {email}")
            
            return {
                'success': True,
                'message': 'Código enviado exitosamente'
            }
        
        except smtplib.SMTPException as e:
            logger.error(f"Error SMTP al enviar código de reporte: {str(e)}")
            return {
                'success': False,
                'message': 'Error al enviar el código por email'
            }
        except Exception as e:
            logger.error(f"Error inesperado al enviar código de reporte: {str(e)}")
            return {
                'success': False,
                'message': 'Error al enviar el código'
            }

