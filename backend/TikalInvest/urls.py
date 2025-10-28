"""
URL configuration for TikalInvest project.
"""

from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Apps URLs
    path('api/users/', include('apps.users.urls')),
    path('api/stocks/', include('apps.stocks.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/admin/', include('apps.admin_api.urls')),
    path('api/wallet/', include('apps.wallet.urls')),
    path('api/referrals/', include('apps.referrals.urls')),
    path('api/watchlist/', include('apps.watchlist.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    
    # Auth Endpoints
    path('api/auth/verify/', views.verify_auth0_user, name='verify_auth0_user'),
    path('api/auth/profile/', views.user_profile, name='user_profile'),
    
    # Portfolio Endpoints
    path('api/portfolio/', views.portfolio_data, name='portfolio_data'),
    path('api/portfolio/summary/', views.portfolio_summary, name='portfolio_summary'),
    path('api/portfolio/stats/', views.portfolio_stats, name='portfolio_stats'),
    path('api/portfolio/history/', views.portfolio_history, name='portfolio_history'),
    
    # Profile Endpoints (alternativa a users)
    path('api/profile/', include('apps.users.urls')),
    
    # Referral Endpoint
    path('api/referral/use/', views.use_referral_code, name='use_referral_code'),
]