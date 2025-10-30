from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Referral(models.Model):
    # Relaciones
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    
    # Estado
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('active', 'Active'),
            ('inactive', 'Inactive')
        ],
        default='pending'
    )
    
    # Ganancias
    earnings_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_credited = models.BooleanField(default=False)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('referrer', 'referred_user')