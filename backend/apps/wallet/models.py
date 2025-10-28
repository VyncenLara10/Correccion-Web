from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class WalletTransaction(models.Model):
    TRANSACTION_TYPE = [
        ("deposit", "Deposit"),
        ("withdraw", "Withdraw"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wallet_transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference_code = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.transaction_type == "deposit":
            self.user.balance = round(self.user.balance + self.amount, 2)
        elif self.transaction_type == "withdraw":
            self.user.balance = round(self.user.balance - self.amount, 2)

        self.user.save()

    def __str__(self):
        return f"{self.transaction_type} - {self.user.username} - {self.amount}"