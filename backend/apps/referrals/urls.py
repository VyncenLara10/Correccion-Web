from django.urls import path
from .views import referral_list, referral_stats

urlpatterns = [
    path("", referral_list, name="referral_list"),
    path("stats/", referral_stats, name="referral_stats"),
]