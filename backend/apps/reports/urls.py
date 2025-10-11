from django.urls import path
from .views import RequestReportView

urlpatterns = [
    path("request/", RequestReportView.as_view(), name="request_report"),
]
