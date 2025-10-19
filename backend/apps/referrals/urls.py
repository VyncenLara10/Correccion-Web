from django.urls import path
from .views import ReferralListView, ReferralStatsView

urlpatterns = [
    path("", ReferralListView.as_view()),
    path("stats/", ReferralStatsView.as_view()),
]
