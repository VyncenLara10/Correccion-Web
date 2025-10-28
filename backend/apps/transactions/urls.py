from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListView.as_view(), name='transaction-list'),
    path('create/', views.TransactionCreateView.as_view(), name='transaction-create'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('buy/', views.BuyStockView.as_view(), name='transaction-buy'),
    path('sell/', views.SellStockView.as_view(), name='transaction-sell'),
    path('stats/', views.TransactionStatsView.as_view(), name='transaction-stats'),
]