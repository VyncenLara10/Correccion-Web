import json
import requests
from jose import jwt
from django.conf import settings
from rest_framework import authentication, exceptions, permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        payload = getattr(request.user, "auth0_payload", {})
        return payload.get("role") == "admin"

class Auth0JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return None

        parts = auth.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            raise exceptions.AuthenticationFailed("Authorization header must be Bearer token")

        token = parts[1]
        try:
            jsonurl = requests.get(f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json")
            jwks = jsonurl.json()
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks["keys"]:
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "use": key["use"],
                        "n": key["n"],
                        "e": key["e"]
                    }
            if rsa_key:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=settings.AUTH0_ALGORITHMS,
                    audience=settings.AUTH0_API_AUDIENCE,
                    issuer=f"https://{settings.AUTH0_DOMAIN}/"
                )
            else:
                raise exceptions.AuthenticationFailed("Unable to find appropriate key")
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.JWTClaimsError:
            raise exceptions.AuthenticationFailed("Incorrect claims")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Unable to parse authentication token: {str(e)}")

        # USAR TU MODELO USER PERSONALIZADO CORRECTAMENTE
        auth0_id = payload["sub"]
        email = payload.get("email", "")
        name = payload.get("name", "")
        email_verified = payload.get("email_verified", False)

        try:
            # Buscar usuario por auth0_id
            user = User.objects.get(username=auth0_id)
            
            # Actualizar datos del usuario si es necesario
            update_fields = []
            if user.email != email:
                user.email = email
                update_fields.append('email')
            
            if name:
                first_name = name.split(' ')[0] if name else ''
                last_name = ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else ''
                
                if user.first_name != first_name:
                    user.first_name = first_name
                    update_fields.append('first_name')
                if user.last_name != last_name:
                    user.last_name = last_name
                    update_fields.append('last_name')
            
            if user.is_verified != email_verified:
                user.is_verified = email_verified
                update_fields.append('is_verified')
            
            if update_fields:
                user.save(update_fields=update_fields)
                
        except User.DoesNotExist:
            # Crear nuevo usuario con TU modelo personalizado
            first_name = name.split(' ')[0] if name else ''
            last_name = ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else ''
            
            user = User(
                username=auth0_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_verified=email_verified,
                role="user",  # Valor por defecto
                balance=10000.00,  # Balance inicial para trading
                is_active=True
            )
            user.set_unusable_password()  # Importante para usuarios Auth0
            user.save()  # El referral_code se genera automáticamente en save()

        # Guardamos el payload para usarlo después si queremos verificar roles
        user.auth0_payload = payload
        return (user, token)