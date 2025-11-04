from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockTransactionViewSet, PortfolioViewSet

router = DefaultRouter()
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    path('', include(router.urls)),
]
