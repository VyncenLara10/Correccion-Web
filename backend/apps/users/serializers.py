from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, EmailVerificationCode, PaymentMethod, UserBalance, DepositTransaction, ReportRequest
from services.email_service import ZerobounceSendEmailService


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializador para registro de nuevos usuarios"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2', 'phone')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Valida que las contraseñas coincidan"""
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return attrs
    
    def create(self, validated_data):
        """Crea un nuevo usuario"""
        email = validated_data['email']
        # Usar el email como username (sin la parte del dominio para que sea más corto)
        username = email.split('@')[0]
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            email_verified=False
        )
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Serializador para verificar correo electrónico"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, min_length=6, required=True)
    
    def validate_code(self, value):
        """Valida que el código sea numérico"""
        if not value.isdigit():
            raise serializers.ValidationError("El código debe contener solo dígitos.")
        return value


class SendVerificationCodeSerializer(serializers.Serializer):
    """Serializador para enviar código de verificación"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Valida que el correo exista y no esté verificado"""
        try:
            user = User.objects.get(email=value)
            if user.email_verified:
                raise serializers.ValidationError("Este correo ya ha sido verificado.")
        except User.DoesNotExist:
            raise serializers.ValidationError("El correo no existe.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Serializador para mostrar información del usuario"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'email_verified', 
                  'role', 'status', 'phone', 'avatar_url', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email_verified', 'role', 'status', 'created_at', 'updated_at')


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializador para métodos de pago"""
    masked_number = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentMethod
        fields = ('id', 'payment_type', 'alias', 'status', 'is_default', 'masked_number',
                  'card_brand', 'account_type', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'masked_number')
    
    def get_masked_number(self, obj):
        return obj.get_masked_number()


class PaymentMethodCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear métodos de pago"""
    
    class Meta:
        model = PaymentMethod
        fields = ('payment_type', 'alias', 'card_number', 'card_holder', 'expiry_month', 
                  'expiry_year', 'cvv', 'card_brand', 'bank_name', 'account_number', 
                  'account_holder', 'routing_number', 'account_type', 'is_default')
    
    def validate(self, data):
        payment_type = data.get('payment_type')
        
        if payment_type == 'credit_card':
            if not all([data.get('card_number'), data.get('card_holder'), 
                       data.get('expiry_month'), data.get('expiry_year'), data.get('cvv')]):
                raise serializers.ValidationError("Se requieren todos los datos de la tarjeta")
            
            # Validar formato de tarjeta (16 dígitos sin guiones)
            card_num = data.get('card_number', '').replace('-', '').replace(' ', '')
            if not card_num.isdigit() or len(card_num) != 16:
                raise serializers.ValidationError("El número de tarjeta debe tener 16 dígitos")
            
            # Guardar formateado
            data['card_number'] = f"{card_num[:4]}-{card_num[4:8]}-{card_num[8:12]}-{card_num[12:]}"
            
        elif payment_type == 'bank_account':
            if not all([data.get('bank_name'), data.get('account_number'), 
                       data.get('account_holder'), data.get('routing_number')]):
                raise serializers.ValidationError("Se requieren todos los datos de la cuenta bancaria")
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        
        # Si es default, desactivar otros
        if validated_data.get('is_default'):
            PaymentMethod.objects.filter(user=user, is_default=True).update(is_default=False)
        
        return PaymentMethod.objects.create(**validated_data)


class UserBalanceSerializer(serializers.ModelSerializer):
    """Serializador para balance del usuario"""
    
    class Meta:
        model = UserBalance
        fields = ('id', 'available_balance', 'pending_balance', 'total_deposits', 
                  'total_withdrawals', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class DepositTransactionSerializer(serializers.ModelSerializer):
    """Serializador para transacciones de depósito"""
    payment_method_alias = serializers.CharField(source='payment_method.alias', read_only=True)
    
    class Meta:
        model = DepositTransaction
        fields = ('id', 'amount', 'status', 'description', 'reference_number', 
                  'payment_method_alias', 'created_at', 'completed_at')
        read_only_fields = ('id', 'status', 'reference_number', 'created_at', 'completed_at')


class DepositTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear depósitos"""
    
    class Meta:
        model = DepositTransaction
        fields = ('amount', 'payment_method', 'description')
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        if value > 1000000:  # Máximo 1 millón USD por transacción
            raise serializers.ValidationError("El monto máximo es de $1,000,000")
        return value
    
    def create(self, validated_data):
        import uuid
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['reference_number'] = f"DEP-{user.id.hex[:8]}-{uuid.uuid4().hex[:8]}".upper()
        
        return DepositTransaction.objects.create(**validated_data)


class ReportRequestSerializer(serializers.ModelSerializer):
    """Serializador para solicitar reportes"""
    
    class Meta:
        model = ReportRequest
        fields = ('id', 'report_types', 'start_date', 'end_date', 'recipient_email', 'status', 'report_code', 'created_at')
        read_only_fields = ('id', 'status', 'report_code', 'created_at')


class ReportRequestCreateSerializer(serializers.Serializer):
    """Serializador para crear solicitudes de reporte"""
    report_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['complete', 'profile', 'portfolio', 'transactions', 'performance']),
        help_text="Tipos de reporte: complete, profile, portfolio, transactions, performance"
    )
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    recipient_email = serializers.EmailField()
    
    def validate(self, data):
        """Valida que start_date no sea mayor a end_date"""
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("La fecha de inicio no puede ser mayor que la fecha de fin")
        return data
    
    def create(self, validated_data):
        from apps.users.models import ReportRequest
        from django.utils import timezone
        from datetime import timedelta
        
        user = self.context['request'].user
        report_code = ZerobounceSendEmailService.generate_verification_code()
        
        # Crear solicitud
        report_request = ReportRequest.objects.create(
            user=user,
            report_types=','.join(validated_data['report_types']),
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            recipient_email=validated_data['recipient_email'],
            report_code=report_code,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        return report_request
