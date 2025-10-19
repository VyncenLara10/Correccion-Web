from django.urls import path
from .views import DashboardRecentActivityView, DashboardStatsView

urlpatterns = [
    path("stats/", DashboardStatsView.as_view()),
    path("recent-activity/", DashboardRecentActivityView.as_view()),
]
