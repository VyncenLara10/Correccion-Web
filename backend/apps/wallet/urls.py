from django.urls import path
from .views import wallet_balance

urlpatterns = [
    path("balance/", wallet_balance, name="wallet_balance"),
]