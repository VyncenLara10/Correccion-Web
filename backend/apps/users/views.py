from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .permissions import IsAdminUser
from TikalInvest.auth import IsAdmin

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

from rest_framework.views import APIView
from rest_framework import status

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role,
            "balance": user.balance,
            "is_verified": user.is_verified
        })

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

from rest_framework.decorators import api_view, permission_classes

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def toggle_user_verification(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_verified = not user.is_verified
        user.save()
        return Response({"id": user.id, "is_verified": user.is_verified})
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "balance": user.balance,
            "referral_code": user.referral_code,
            "created_at": user.date_joined
        }
        return Response({"user": data})

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Si usas JWT, se puede eliminar el token del frontend
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        for field in ["name", "email"]:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response({"message": "Profile updated"})

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        if not user.check_password(current_password):
            return Response({"error": "Current password incorrect"}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed"})

class UploadAvatarView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.data.get("avatar")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        request.user.avatar.save(file.name, file)
        return Response({"message": "Avatar uploaded"})