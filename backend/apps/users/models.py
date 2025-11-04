import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator
from django.utils import timezone
from datetime import timedelta

class EmailVerificationCode(models.Model):
    """Modelo para almacenar códigos de verificación de correo"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=False, db_index=True)
    code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'email_verification_codes'
        indexes = [
            models.Index(fields=['email', 'code']),
        ]
    
    def __str__(self):
        return f"Verification Code for {self.email}"
    
    def is_expired(self):
        """Verifica si el código ha expirado"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Verifica si el código es válido (no expirado y no verificado)"""
        return not self.is_expired() and not self.is_verified and self.attempts < 5


class User(AbstractUser):
    """Modelo extendido de usuario"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('deleted', 'Deleted'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    email_verified = models.BooleanField(default=False)
    twofa_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def mark_email_as_verified(self):
        """Marca el correo como verificado"""
        self.email_verified = True
        self.save()


class PaymentMethod(models.Model):
    """Modelo para almacenar métodos de pago ficticios del usuario"""
    PAYMENT_TYPE_CHOICES = [
        ('credit_card', 'Tarjeta de Crédito'),
        ('bank_account', 'Cuenta Bancaria'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('expired', 'Expirado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    
    # Campos para tarjeta de crédito
    card_number = models.CharField(max_length=19, blank=True, null=True)  # Formato: XXXX-XXXX-XXXX-XXXX
    card_holder = models.CharField(max_length=100, blank=True, null=True)
    expiry_month = models.IntegerField(blank=True, null=True)
    expiry_year = models.IntegerField(blank=True, null=True)
    cvv = models.CharField(max_length=4, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)  # Visa, Mastercard, etc
    
    # Campos para cuenta bancaria
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=20, blank=True, null=True)
    account_holder = models.CharField(max_length=100, blank=True, null=True)
    routing_number = models.CharField(max_length=20, blank=True, null=True)
    account_type = models.CharField(max_length=20, blank=True, null=True)  # Checking, Savings
    
    # Campos generales
    alias = models.CharField(max_length=100, help_text="Nombre personalizado del método de pago", default="Mi método de pago")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_default = models.BooleanField(default=False)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_methods'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.alias} - {self.user.email}"
    
    def get_masked_number(self):
        """Retorna el número de tarjeta/cuenta enmascarado para seguridad"""
        if self.payment_type == 'credit_card' and self.card_number:
            return f"****-****-****-{self.card_number[-4:]}"
        elif self.payment_type == 'bank_account' and self.account_number:
            return f"****{self.account_number[-4:]}"
        return "****"


class UserBalance(models.Model):
    """Modelo para almacenar el balance disponible del usuario (ficticio en USD)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='balance')
    available_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # USD disponibles
    pending_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # Depósitos pendientes
    total_deposits = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # Total depositado
    total_withdrawals = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)  # Total retirado
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    
    class Meta:
        db_table = 'user_balances'
    
    def __str__(self):
        return f"{self.user.email} - Balance: ${self.available_balance}"
    
    def add_balance(self, amount):
        """Agrega dinero al balance disponible"""
        self.available_balance += amount
        self.total_deposits += amount
        self.save()
    
    def subtract_balance(self, amount):
        """Resta dinero del balance disponible"""
        if self.available_balance >= amount:
            self.available_balance -= amount
            self.total_withdrawals += amount
            self.save()
            return True
        return False


class DepositTransaction(models.Model):
    """Modelo para registrar depósitos de dinero ficticio"""
    DEPOSIT_STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deposit_transactions')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=DEPOSIT_STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=50, unique=True)  # Para seguimiento
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'deposit_transactions'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Deposit {self.reference_number} - {self.user.email} - ${self.amount}"
    
    def complete_deposit(self):
        """Completa el depósito y actualiza el balance"""
        if self.status == 'pending':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            
            # Actualizar balance del usuario
            user_balance, created = UserBalance.objects.get_or_create(user=self.user)
            user_balance.add_balance(self.amount)


class ReportRequest(models.Model):
    """Modelo para solicitudes de reporte en PDF"""
    REPORT_TYPE_CHOICES = [
        ('complete', 'Reporte Completo'),
        ('profile', 'Perfil'),
        ('portfolio', 'Portafolio'),
        ('transactions', 'Transacciones'),
        ('performance', 'Rendimiento'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'En Procesamiento'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('sent', 'Enviado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_requests')
    
    # Configuración del reporte
    report_types = models.CharField(max_length=200, help_text="Tipos separados por comas: complete, profile, portfolio, transactions, performance")
    start_date = models.DateField()
    end_date = models.DateField()
    recipient_email = models.EmailField()
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    report_code = models.CharField(max_length=6, unique=True, db_index=True)  # Código único para el reporte
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()  # Expira después de 24 horas
    
    class Meta:
        db_table = 'report_requests'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['report_code']),
        ]
    
    def __str__(self):
        return f"Report {self.report_code} - {self.user.email} - {self.status}"
    
    def is_expired(self):
        """Verifica si la solicitud ha expirado"""
        return timezone.now() > self.expires_at
    
    def mark_as_sent(self):
        """Marca el reporte como enviado"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
