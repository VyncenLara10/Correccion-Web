from django.urls import path
from .views import WatchlistView, ToggleWatchlistView

urlpatterns = [
    path("", WatchlistView.as_view()),
    path("toggle/<int:stock_id>/", ToggleWatchlistView.as_view()),
]
