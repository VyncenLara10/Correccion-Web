from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    referred_by_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "password",
            "role", "balance", "referral_code", "referred_by_code", "is_verified"
        ]
        read_only_fields = ["balance", "referral_code", "is_verified"]

    def create(self, validated_data):
        referred_code = validated_data.pop("referred_by_code", None)
        user = User(**validated_data)
        user.set_password(validated_data["password"])
        user.save()

        if referred_code:
            try:
                referrer = User.objects.get(referral_code=referred_code)
                user.referred_by = referrer
                user.balance += 5
                referrer.balance += 5
                user.save()
                referrer.save()
            except User.DoesNotExist:
                pass

        return user
