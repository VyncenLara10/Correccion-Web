from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Referral(models.Model):
    referrer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="referrals_made"
    )
    referred = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="referrals_received"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    bonus_granted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("referrer", "referred")

    def __str__(self):
        return f"{self.referrer.username} -> {self.referred.username}"
from django.db import models

