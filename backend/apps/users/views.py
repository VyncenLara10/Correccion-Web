from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .serializers import UserSerializer
from .permissions import IsAdminUser
from TikalInvest.auth import IsAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Registro de nuevo usuario"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    """Login de usuario"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            if username:
                user = User.objects.get(username=username)
            elif email:
                user = User.objects.get(email=email)
            else:
                return Response({'error': 'Username o email requerido'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'balance': float(user.balance),
                'is_verified': user.is_verified
            }
        })


class LogoutView(APIView):
    """Logout de usuario"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """Obtener usuario actual"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'balance': float(user.balance),
            'referral_code': user.referral_code,
            'is_verified': user.is_verified,
            'created_at': user.date_joined
        }
        return Response({'user': data})


class UpdateProfileView(APIView):
    """Actualizar perfil de usuario"""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        
        allowed_fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'address', 'country']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        return Response({
            'message': 'Perfil actualizado exitosamente',
            'user': UserSerializer(user).data
        })


class ChangePasswordView(APIView):
    """Cambiar contraseña del usuario"""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({'error': 'Contraseña actual y nueva requeridas'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(current_password):
            return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Contraseña actualizada exitosamente'})


class UploadAvatarView(APIView):
    """Subir avatar del usuario"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        avatar = request.FILES.get('avatar')
        
        if not avatar:
            return Response({'error': 'No se proporciono imagen'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar tamaño de imagen (max 5MB)
        if avatar.size > 5 * 1024 * 1024:
            return Response({'error': 'La imagen debe ser menor a 5MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar tipo de archivo
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if avatar.content_type not in allowed_types:
            return Response({'error': 'Formato de imagen no permitido'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Guardar avatar (asumiendo que el modelo User tiene un campo avatar)
        user.avatar = avatar
        user.save()
        
        return Response({
            'message': 'Avatar actualizado exitosamente',
            'avatar_url': user.avatar.url if user.avatar else None
        })


class ForgotPasswordView(APIView):
    """Solicitar recuperacion de contraseña"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el email existe
            return Response({'message': 'Si el email existe, recibiras instrucciones para recuperar tu contraseña'})
        
        # Generar token de recuperacion
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # URL para resetear contraseña (ajustar segun tu frontend)
        reset_url = f"{request.scheme}://{request.get_host()}/reset-password/{uid}/{token}/"
        
        # Enviar email
        try:
            send_mail(
                'Recuperacion de Contraseña - Tikal Invest',
                f'Haz clic en el siguiente enlace para resetear tu contraseña: {reset_url}',
                'noreply@tikalinvest.com',
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'error': 'Error al enviar email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': 'Si el email existe, recibiras instrucciones para recuperar tu contraseña'})


class ResetPasswordView(APIView):
    """Resetear contraseña con token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        if not all([uidb64, token, new_password]):
            return Response({'error': 'Todos los campos son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Token invalido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token invalido o expirado'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Contraseña actualizada exitosamente'})


class UserListView(generics.ListAPIView):
    """Lista de usuarios (solo admin)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def toggle_user_verification(request, user_id):
    """Alternar verificacion de usuario (solo admin)"""
    try:
        user = User.objects.get(id=user_id)
        user.is_verified = not user.is_verified
        user.save()
        return Response({'id': user.id, 'is_verified': user.is_verified})
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)