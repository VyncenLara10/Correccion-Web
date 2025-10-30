from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    # Campos básicos
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    
    # Campos financieros
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Sistema de referidos
    referral_code = models.CharField(max_length=10, unique=True, editable=False)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    
    # Verificación
    is_verified = models.BooleanField(default=False)
    
    # Auth0
    auth0_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    # Información adicional
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=100, default='Guatemala')
    
    # Permisos
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('admin', 'Admin')], default='user')