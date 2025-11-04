import io
from datetime import datetime
from decimal import Decimal
from django.core.mail import EmailMessage
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class ReportService:
    """Servicio para generar y enviar reportes en PDF"""
    
    def __init__(self):
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        
        self.letter = letter
        self.A4 = A4
        self.inch = inch
        self.colors = colors
        self.styles = getSampleStyleSheet()
        self.ParagraphStyle = ParagraphStyle
        
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=1  # Center
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=12
        )
        )
    
    def generate_and_send_report(self, user, report_types, start_date, end_date, recipient_email):
        """
        Genera un reporte PDF y lo envía por email
        
        Args:
            user: Usuario para el que generar el reporte
            report_types: Lista de tipos de reporte ['complete', 'profile', 'portfolio', 'transactions', 'performance']
            start_date: Fecha de inicio (date object)
            end_date: Fecha de fin (date object)
            recipient_email: Email donde enviar el reporte
            
        Returns:
            dict: {'success': bool, 'message': str, 'file': BytesIO}
        """
        try:
            # Importar reportlab solo cuando se necesite
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
            from reportlab.lib import colors
            
            # Crear PDF en memoria
            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
            story = []
            
            # Agregar título
            story.append(Paragraph("TikalInvest - Reporte Personalizado", self.title_style))
            story.append(Spacer(1, 0.3 * inch))
            
            # Información del período
            period_text = f"Período: {start_date.strftime('%d/%m/%Y')} - {end_date.strftime('%d/%m/%Y')}"
            story.append(Paragraph(period_text, self.styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))
            
            generated_date = datetime.now().strftime('%d/%m/%Y %H:%M')
            story.append(Paragraph(f"Generado: {generated_date}", self.styles['Normal']))
            story.append(Spacer(1, 0.3 * inch))
            
            # Agregar secciones según tipos solicitados
            if 'complete' in report_types or 'profile' in report_types:
                story.extend(self._generate_profile_section(user, Paragraph, Spacer, inch, colors, Table, TableStyle))
            
            if 'complete' in report_types or 'portfolio' in report_types:
                story.extend(self._generate_portfolio_section(user, start_date, end_date, Paragraph, Spacer, inch, colors, Table, TableStyle))
            
            if 'complete' in report_types or 'transactions' in report_types:
                story.extend(self._generate_transactions_section(user, start_date, end_date, Paragraph, Spacer, inch, colors, Table, TableStyle))
            
            if 'complete' in report_types or 'performance' in report_types:
                story.extend(self._generate_performance_section(user, start_date, end_date, Paragraph, Spacer, inch, colors, Table, TableStyle))
            
            # Construir PDF
            doc.build(story)
            pdf_buffer.seek(0)
            
            # Enviar por email
            email_result = self._send_pdf_email(
                recipient_email,
                user.first_name,
                pdf_buffer,
                start_date,
                end_date
            )
            
            if email_result.get('success'):
                return {
                    'success': True,
                    'message': 'Reporte generado y enviado exitosamente',
                    'file': pdf_buffer
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al enviar el reporte por email'
                }
        
        except Exception as e:
            logger.error(f"Error generando reporte: {str(e)}")
            return {
                'success': False,
                'message': f'Error generando reporte: {str(e)}'
            }
    
    def _generate_profile_section(self, user):
        """Genera sección de perfil del usuario"""
        elements = []
        elements.append(Paragraph("📋 Información de Perfil", self.heading_style))
        
        profile_data = [
            ['Nombre Completo', f"{user.first_name} {user.last_name}"],
            ['Correo Electrónico', user.email],
            ['Teléfono', user.phone or 'No proporcionado'],
            ['Rol', user.get_role_display() if hasattr(user, 'get_role_display') else user.role],
            ['Estado de Cuenta', user.get_status_display() if hasattr(user, 'get_status_display') else user.status],
            ['Email Verificado', '✓ Sí' if user.email_verified else '✗ No'],
            ['Fecha de Registro', user.created_at.strftime('%d/%m/%Y')],
        ]
        
        table = Table(profile_data, colWidths=[2*inch, 3.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(PageBreak())
        
        return elements
    
    def _generate_portfolio_section(self, user, start_date, end_date):
        """Genera sección de portafolio"""
        elements = []
        elements.append(Paragraph("💼 Estado del Portafolio", self.heading_style))
        
        try:
            from apps.portfolio.models import Portfolio, StockTransaction
            
            portfolio = Portfolio.objects.get(user=user)
            
            # Información general del portafolio
            portfolio_data = [
                ['Valor Total del Portafolio', f"${portfolio.total_value:,.2f}"],
                ['Inversión Total', f"${portfolio.total_invested:,.2f}"],
                ['Ganancias/Pérdidas', f"${portfolio.total_gains:,.2f}"],
                ['Retorno %', f"{portfolio.gains_percentage:.2f}%"],
                ['Cantidad de Acciones', f"{portfolio.total_shares}"],
            ]
            
            table = Table(portfolio_data, colWidths=[2*inch, 3.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 0.2 * inch))
            
            # Distribución de activos
            holdings = portfolio.get_holdings()
            if holdings:
                elements.append(Paragraph("Distribución de Activos", self.styles['Heading3']))
                
                holdings_data = [['Símbolo', 'Cantidad', 'Precio Promedio', 'Valor Total']]
                for symbol, data in holdings.items():
                    holdings_data.append([
                        symbol,
                        str(data['shares']),
                        f"${data['averagePrice']:.2f}",
                        f"${data['totalValue']:.2f}"
                    ])
                
                holdings_table = Table(holdings_data, colWidths=[1*inch, 1*inch, 1.5*inch, 1.5*inch])
                holdings_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ]))
                
                elements.append(holdings_table)
        
        except Exception as e:
            logger.error(f"Error generando portafolio: {str(e)}")
            elements.append(Paragraph(f"No hay datos de portafolio disponibles", self.styles['Normal']))
        
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(PageBreak())
        
        return elements
    
    def _generate_transactions_section(self, user, start_date, end_date):
        """Genera sección de transacciones"""
        elements = []
        elements.append(Paragraph("📊 Historial de Transacciones", self.heading_style))
        
        try:
            from apps.portfolio.models import StockTransaction
            
            transactions = StockTransaction.objects.filter(
                user=user,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).order_by('-created_at')[:50]  # Últimas 50
            
            if transactions:
                tx_data = [['Fecha', 'Símbolo', 'Tipo', 'Cantidad', 'Precio', 'Total']]
                
                for tx in transactions:
                    tx_data.append([
                        tx.created_at.strftime('%d/%m/%Y'),
                        tx.symbol,
                        tx.transaction_type.upper(),
                        str(tx.shares),
                        f"${tx.price_per_share:.2f}",
                        f"${tx.total_value:.2f}"
                    ])
                
                table = Table(tx_data, colWidths=[1*inch, 1*inch, 0.7*inch, 0.8*inch, 1*inch, 1*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 9),
                    ('FONTSIZE', (0, 1), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ]))
                
                elements.append(table)
            else:
                elements.append(Paragraph("No hay transacciones en el período especificado", self.styles['Normal']))
        
        except Exception as e:
            logger.error(f"Error generando transacciones: {str(e)}")
            elements.append(Paragraph(f"No hay datos de transacciones disponibles", self.styles['Normal']))
        
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(PageBreak())
        
        return elements
    
    def _generate_performance_section(self, user, start_date, end_date):
        """Genera sección de rendimiento"""
        elements = []
        elements.append(Paragraph("📈 Análisis de Rendimiento", self.heading_style))
        
        try:
            from apps.portfolio.models import Portfolio
            
            portfolio = Portfolio.objects.get(user=user)
            
            performance_data = [
                ['Métrica', 'Valor'],
                ['Valor Total del Portafolio', f"${portfolio.total_value:,.2f}"],
                ['Inversión Total', f"${portfolio.total_invested:,.2f}"],
                ['Ganancias Totales', f"${portfolio.total_gains:,.2f}"],
                ['Retorno Porcentual', f"{portfolio.gains_percentage:.2f}%"],
                ['Cantidad de Acciones', str(portfolio.total_shares)],
                ['Última Actualización', portfolio.updated_at.strftime('%d/%m/%Y %H:%M')],
            ]
            
            table = Table(performance_data, colWidths=[2.5*inch, 3.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f0f0f0')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            
            elements.append(table)
            
            # Notas
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph("<b>Notas:</b>", self.styles['Normal']))
            elements.append(Paragraph(
                "• El retorno porcentual se calcula basado en la inversión inicial y el valor actual",
                self.styles['Normal']
            ))
            elements.append(Paragraph(
                "• Las ganancias se calculan como la diferencia entre el valor actual y la inversión",
                self.styles['Normal']
            ))
        
        except Exception as e:
            logger.error(f"Error generando rendimiento: {str(e)}")
            elements.append(Paragraph(f"No hay datos de rendimiento disponibles", self.styles['Normal']))
        
        elements.append(Spacer(1, 0.3 * inch))
        
        return elements
    
    def _send_pdf_email(self, recipient_email, user_name, pdf_buffer, start_date, end_date):
        """Envía el PDF por email"""
        try:
            subject = f"TikalInvest - Reporte {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}"
            
            message = f"""
            Hola {user_name},
            
            Te enviamos el reporte solicitado de TikalInvest.
            
            Período: {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}
            Fecha de Generación: {datetime.now().strftime('%d/%m/%Y %H:%M')}
            
            El archivo PDF se encuentra adjunto.
            
            Saludos,
            TikalInvest Team
            """
            
            email = EmailMessage(
                subject=subject,
                body=message,
                from_email=settings.EMAIL_HOST_USER,
                to=[recipient_email]
            )
            
            # Adjuntar PDF
            email.attach(
                f"Reporte_TikalInvest_{start_date.strftime('%d%m%Y')}.pdf",
                pdf_buffer.getvalue(),
                "application/pdf"
            )
            
            email.send()
            
            return {
                'success': True,
                'message': 'Email enviado exitosamente'
            }
        
        except Exception as e:
            logger.error(f"Error enviando email: {str(e)}")
            return {
                'success': False,
                'message': f'Error enviando email: {str(e)}'
            }
