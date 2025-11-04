from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from apps.stocks.views import StocksViewSet

router = DefaultRouter()
router.register(r'stocks', StocksViewSet, basename='stocks')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include('apps.users.urls')),
    path('api/auth/', include('apps.auth.urls')),
    path('api/portfolio/', include('apps.portfolio.urls')),
    path('api/', include('apps.admin_panel.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
