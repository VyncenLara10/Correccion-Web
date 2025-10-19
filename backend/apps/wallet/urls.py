from django.urls import path
from .views import WalletBalanceView, DepositView, WithdrawView, WalletHistoryView

urlpatterns = [
    path("balance/", WalletBalanceView.as_view()),
    path("deposit/", DepositView.as_view()),
    path("withdrawal/", WithdrawView.as_view()),
    path("history/", WalletHistoryView.as_view()),
]
