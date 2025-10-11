from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .permissions import IsAdminUser

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
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

from rest_framework.decorators import api_view, permission_classes

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def toggle_user_verification(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_verified = not user.is_verified
        user.save()
        return Response({"id": user.id, "is_verified": user.is_verified})
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
