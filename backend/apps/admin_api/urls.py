from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/status/', views.AdminUserStatusView.as_view(), name='admin-user-status'),
    
    path('stocks/', views.AdminStockListCreateView.as_view(), name='admin-stock-list-create'),
    path('stocks/<int:pk>/', views.AdminStockDetailView.as_view(), name='admin-stock-detail'),
    path('stocks/<int:pk>/toggle-active/', views.AdminStockToggleActiveView.as_view(), name='admin-stock-toggle'),
    
    path('transactions/', views.AdminTransactionListView.as_view(), name='admin-transaction-list'),
    path('transactions/<int:pk>/status/', views.AdminTransactionStatusView.as_view(), name='admin-transaction-status'),

    path('reports/dashboard/', views.AdminDashboardReportView.as_view(), name='admin-dashboard-report'),
    path('reports/transactions/', views.AdminTransactionsReportView.as_view(), name='admin-transactions-report'),
    path('reports/users/', views.AdminUsersReportView.as_view(), name='admin-users-report'),
]
