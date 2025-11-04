from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .models import User, EmailVerificationCode, PaymentMethod, UserBalance, DepositTransaction, ReportRequest
from .serializers import (
    UserRegisterSerializer,
    EmailVerificationSerializer,
    SendVerificationCodeSerializer,
    UserSerializer,
    PaymentMethodSerializer,
    PaymentMethodCreateSerializer,
    UserBalanceSerializer,
    DepositTransactionSerializer,
    DepositTransactionCreateSerializer,
    ReportRequestSerializer,
    ReportRequestCreateSerializer
)
from services.email_service import ZerobounceSendEmailService

logger = logging.getLogger(__name__)



class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar usuarios"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Define permisos según la acción"""
        if self.action in ['register', 'send_verification_code', 'verify_code', 'login']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Endpoint para registrar un nuevo usuario
        
        POST /api/users/register/
        {
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "StrongPassword123!",
            "password2": "StrongPassword123!",
            "phone": "+1234567890" (opcional)
        }
        """
        serializer = UserRegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Datos inválidos para el registro'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar email con Zerobounce (comentado temporalmente para desarrollo)
        # email_service = ZerobounceSendEmailService()
        # zerobounce_result = email_service.validate_email_with_zerobounce(
        #     serializer.validated_data['email']
        # )
        # 
        # if not zerobounce_result['valid']:
        #     return Response(
        #         {
        #             'success': False,
        #             'message': 'El correo electrónico no es válido',
        #             'detail': zerobounce_result['message']
        #         },
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        try:
            # Crear usuario
            user = serializer.save()
            print(f"✅ Usuario creado: {user.email}")
            
            # Generar y enviar código de verificación
            email_service = ZerobounceSendEmailService()
            verification_code = email_service.generate_verification_code()
            print(f"✅ Código generado: {verification_code}")
            
            email_service.save_verification_code(user.email, verification_code)
            print(f"✅ Código guardado en BD")
            
            email_result = email_service.send_verification_email(
                user.email,
                verification_code
            )
            print(f"📧 Resultado del email: {email_result}")
            
            if not email_result['success']:
                return Response(
                    {
                        'success': False,
                        'message': 'Usuario creado pero no se pudo enviar el código de verificación',
                        'detail': email_result['message']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {
                    'success': True,
                    'message': 'Usuario registrado exitosamente. Por favor verifica tu correo.',
                    'user': UserSerializer(user).data,
                    'next_step': 'verify_email'
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error al registrar usuario: {str(e)}")
            return Response(
                {
                    'success': False,
                    'message': 'Error al registrar el usuario',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def send_verification_code(self, request):
        """
        Endpoint para enviar código de verificación a un email
        
        POST /api/users/send_verification_code/
        {
            "email": "user@example.com"
        }
        """
        serializer = SendVerificationCodeSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            email = serializer.validated_data['email']
            email_service = ZerobounceSendEmailService()
            
            # Generar y enviar código
            verification_code = email_service.generate_verification_code()
            email_service.save_verification_code(email, verification_code)
            
            email_result = email_service.send_verification_email(email, verification_code)
            
            if not email_result['success']:
                return Response(
                    {
                        'success': False,
                        'message': email_result['message']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {
                    'success': True,
                    'message': 'Código de verificación enviado a tu correo',
                    'expires_in_minutes': 15
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error al enviar código de verificación: {str(e)}")
            return Response(
                {
                    'success': False,
                    'message': 'Error al enviar el código',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_code(self, request):
        """
        Endpoint para verificar el código enviado al correo
        
        POST /api/users/verify_code/
        {
            "email": "user@example.com",
            "code": "123456"
        }
        """
        serializer = EmailVerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            email_service = ZerobounceSendEmailService()
            verification_result = email_service.verify_code(email, code)
            
            if not verification_result['valid']:
                return Response(
                    {
                        'success': False,
                        'message': verification_result['message']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Marcar el usuario como verificado
            user = User.objects.get(email=email)
            user.mark_email_as_verified()
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response(
                {
                    'success': True,
                    'message': 'Correo verificado exitosamente',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token)
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'message': 'Usuario no encontrado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error al verificar código: {str(e)}")
            return Response(
                {
                    'success': False,
                    'message': 'Error al verificar el código',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Endpoint para login de usuarios
        
        POST /api/users/login/
        {
            "email": "user@example.com",
            "password": "password123"
        }
        """
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {
                    'success': False,
                    'message': 'Email y contraseña requeridos'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar usuario por email
            user = User.objects.get(email=email)
            
            # Verificar contraseña
            if not user.check_password(password):
                return Response(
                    {
                        'success': False,
                        'message': 'Credenciales inválidas'
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Verificar que el email esté verificado
            if not user.email_verified:
                return Response(
                    {
                        'success': False,
                        'message': 'Por favor verifica tu correo antes de iniciar sesión',
                        'next_step': 'verify_email'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar estado del usuario
            if user.status != 'active':
                return Response(
                    {
                        'success': False,
                        'message': f'Tu cuenta está {user.status}'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Generar tokens
            refresh = RefreshToken.for_user(user)
            
            return Response(
                {
                    'success': True,
                    'message': 'Inicio de sesión exitoso',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token)
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'message': 'Credenciales inválidas'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Error al iniciar sesión: {str(e)}")
            return Response(
                {
                    'success': False,
                    'message': 'Error al iniciar sesión'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Endpoint para obtener información del usuario autenticado
        
        GET /api/users/me/
        """
        serializer = UserSerializer(request.user)
        return Response(
            {
                'success': True,
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar métodos de pago ficticios"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna solo métodos de pago del usuario autenticado"""
        return PaymentMethod.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Usa diferentes serializers según la acción"""
        if self.action == 'create':
            return PaymentMethodCreateSerializer
        return PaymentMethodSerializer
    
    def create(self, request, *args, **kwargs):
        """Crear un nuevo método de pago"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Retornar con el serializer de lectura
        read_serializer = PaymentMethodSerializer(serializer.instance)
        return Response(
            {
                'success': True,
                'message': 'Método de pago agregado exitosamente',
                'payment_method': read_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def list_methods(self, request):
        """Listar todos los métodos de pago del usuario"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                'success': True,
                'count': queryset.count(),
                'payment_methods': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Establecer como método de pago predeterminado"""
        payment_method = self.get_object()
        
        # Desactivar otros métodos predeterminados
        PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
        
        # Activar este
        payment_method.is_default = True
        payment_method.save()
        
        serializer = self.get_serializer(payment_method)
        return Response(
            {
                'success': True,
                'message': 'Método de pago establecido como predeterminado',
                'payment_method': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar un método de pago"""
        payment_method = self.get_object()
        payment_method.status = 'inactive'
        payment_method.save()
        
        serializer = self.get_serializer(payment_method)
        return Response(
            {
                'success': True,
                'message': 'Método de pago desactivado',
                'payment_method': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """Eliminar un método de pago"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {
                'success': True,
                'message': 'Método de pago eliminado exitosamente'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class UserBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para ver el balance del usuario"""
    serializer_class = UserBalanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna solo el balance del usuario autenticado"""
        return UserBalance.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtener el balance actual del usuario"""
        try:
            user_balance = UserBalance.objects.get(user=request.user)
        except UserBalance.DoesNotExist:
            # Crear uno nuevo si no existe
            user_balance = UserBalance.objects.create(user=request.user)
        
        serializer = self.get_serializer(user_balance)
        return Response(
            {
                'success': True,
                'balance': serializer.data
            },
            status=status.HTTP_200_OK
        )


class DepositTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar depósitos ficticios"""
    serializer_class = DepositTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna solo las transacciones del usuario autenticado"""
        return DepositTransaction.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Usa diferentes serializers según la acción"""
        if self.action == 'create':
            return DepositTransactionCreateSerializer
        return DepositTransactionSerializer
    
    def create(self, request, *args, **kwargs):
        """Crear un nuevo depósito"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deposit = self.perform_create(serializer)
        
        read_serializer = DepositTransactionSerializer(deposit)
        return Response(
            {
                'success': True,
                'message': 'Depósito iniciado. Se procesará en 1-2 minutos ficticiamente.',
                'deposit': read_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    def perform_create(self, serializer):
        """Guardar el depósito"""
        return serializer.save()
    
    @action(detail=False, methods=['get'])
    def list_deposits(self, request):
        """Listar todos los depósitos del usuario"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                'success': True,
                'count': queryset.count(),
                'deposits': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def process_deposit(self, request, pk=None):
        """Procesar/completar un depósito (simular aprobación)"""
        deposit = self.get_object()
        
        if deposit.status != 'pending':
            return Response(
                {
                    'success': False,
                    'message': f'El depósito no puede procesarse. Estado actual: {deposit.status}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Completar el depósito
        deposit.complete_deposit()
        
        serializer = self.get_serializer(deposit)
        return Response(
            {
                'success': True,
                'message': f'Depósito de ${deposit.amount} USD procesado exitosamente',
                'deposit': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def cancel_deposit(self, request, pk=None):
        """Cancelar un depósito pendiente"""
        deposit = self.get_object()
        
        if deposit.status != 'pending':
            return Response(
                {
                    'success': False,
                    'message': f'No se puede cancelar un depósito con estado: {deposit.status}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deposit.status = 'cancelled'
        deposit.save()
        
        serializer = self.get_serializer(deposit)
        return Response(
            {
                'success': True,
                'message': 'Depósito cancelado',
                'deposit': serializer.data
            },
            status=status.HTTP_200_OK
        )


class ReportRequestViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar solicitudes de reporte"""
    queryset = ReportRequest.objects.all()
    serializer_class = ReportRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo mostrar reportes del usuario autenticado"""
        return ReportRequest.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def request_report(self, request):
        """
        Endpoint para solicitar un reporte - genera y envía PDF directamente
        
        POST /api/reports/request_report/
        {
            "report_types": ["complete"],  o ["profile", "portfolio", "transactions", "performance"]
            "start_date": "2025-01-01",
            "end_date": "2025-01-31",
            "recipient_email": "user@example.com"
        }
        """
        serializer = ReportRequestCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report_request = serializer.save()
        report_request.status = 'processing'
        report_request.save()
        
        # Generar y enviar reporte directamente
        from services.report_service import ReportService
        report_service = ReportService()
        
        try:
            pdf_result = report_service.generate_and_send_report(
                user=request.user,
                report_types=report_request.report_types.split(','),
                start_date=report_request.start_date,
                end_date=report_request.end_date,
                recipient_email=report_request.recipient_email
            )
            
            if pdf_result.get('success'):
                report_request.mark_as_sent()
                return Response(
                    {
                        'success': True,
                        'message': f'Reporte enviado exitosamente a {report_request.recipient_email}',
                        'report': ReportRequestSerializer(report_request).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                report_request.status = 'failed'
                report_request.save()
                return Response(
                    {
                        'success': False,
                        'message': 'Error al generar el reporte',
                        'detail': pdf_result.get('message', 'Error desconocido')
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"Error generando reporte: {str(e)}")
            report_request.status = 'failed'
            report_request.save()
            return Response(
                {
                    'success': False,
                    'message': 'Error al generar el reporte',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_report(self, request):
        """
        Endpoint para verificar código y enviar reporte por email
        
        POST /api/users/reports/send_report/
        {
            "report_code": "123456"
        }
        """
        report_code = request.data.get('report_code')
        
        if not report_code:
            return Response(
                {
                    'success': False,
                    'message': 'Código de reporte requerido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            report_request = ReportRequest.objects.get(
                report_code=report_code,
                user=request.user
            )
        except ReportRequest.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'message': 'Código de reporte inválido'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        if report_request.is_expired():
            report_request.status = 'failed'
            report_request.save()
            return Response(
                {
                    'success': False,
                    'message': 'El código de reporte ha expirado'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar y enviar reporte
        from services.report_service import ReportService
        report_service = ReportService()
        
        report_request.status = 'processing'
        report_request.save()
        
        try:
            pdf_result = report_service.generate_and_send_report(
                user=request.user,
                report_types=report_request.report_types.split(','),
                start_date=report_request.start_date,
                end_date=report_request.end_date,
                recipient_email=report_request.recipient_email
            )
            
            if pdf_result.get('success'):
                report_request.mark_as_sent()
                return Response(
                    {
                        'success': True,
                        'message': 'Reporte enviado exitosamente'
                    },
                    status=status.HTTP_200_OK
                )
            else:
                report_request.status = 'failed'
                report_request.save()
                return Response(
                    {
                        'success': False,
                        'message': 'Error al generar el reporte'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"Error generando reporte: {str(e)}")
            report_request.status = 'failed'
            report_request.save()
            return Response(
                {
                    'success': False,
                    'message': 'Error al generar el reporte'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
