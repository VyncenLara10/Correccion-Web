from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PaymentMethodViewSet, UserBalanceViewSet, DepositTransactionViewSet, ReportRequestViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-methods')
router.register(r'balance', UserBalanceViewSet, basename='balance')
router.register(r'deposits', DepositTransactionViewSet, basename='deposits')
router.register(r'reports', ReportRequestViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]
