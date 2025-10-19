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
                    algorithms=settings.ALGORITHMS,
                    audience=settings.API_IDENTIFIER,
                    issuer=f"https://{settings.AUTH0_DOMAIN}/"
                )
            else:
                raise exceptions.AuthenticationFailed("Unable to find appropriate key")
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.JWTClaimsError:
            raise exceptions.AuthenticationFailed("Incorrect claims")
        except Exception:
            raise exceptions.AuthenticationFailed("Unable to parse authentication token.")

        user, _ = User.objects.get_or_create(username=payload["sub"], defaults={"email": payload.get("email","")})
        # Guardamos el payload para usarlo después si queremos verificar roles
        user.auth0_payload = payload
        return (user, token)
