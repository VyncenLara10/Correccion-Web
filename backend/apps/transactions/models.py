from django.db import models
from django.contrib.auth import get_user_model
from apps.stocks.models import Stock
from decimal import Decimal

User = get_user_model()

class Transaction(models.Model):
    TRANSACTION_TYPE = [
        ("buy", "Buy"),
        ("sell", "Sell"),
        ("deposit", "Deposit"),
        ("withdraw", "Withdraw"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    stock = models.ForeignKey(Stock, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reference_code = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.transaction_type in ["buy", "sell"] and self.stock and self.quantity:
            self.price = self.stock.current_price
            self.total = round(self.price * self.quantity, 2)

        super().save(*args, **kwargs)

        if self.transaction_type == "buy":
            self.user.balance = round(self.user.balance - self.total, 2)
        elif self.transaction_type == "sell":
            self.user.balance = round(self.user.balance + self.total, 2)
        elif self.transaction_type == "deposit":
            self.user.balance = round(self.user.balance + (self.total or 0), 2)
        elif self.transaction_type == "withdraw":
            self.user.balance = round(self.user.balance - (self.total or 0), 2)

        self.user.save()

    def __str__(self):
        return f"{self.transaction_type} - {self.user.username} - {self.total}"
