"""
URL configuration for TikalInvest project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/stocks/', include('apps.stocks.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path("api/admin/", include("admin_api.urls")),
    path("api/wallet/", include("apps.wallet.urls")),
    path("api/referrals/", include("apps.referrals.urls")),
    path("api/watchlist/", include("apps.watchlist.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
]
