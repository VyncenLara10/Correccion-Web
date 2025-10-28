from django.urls import path
from . import views

urlpatterns = [
    path('', views.StockListView.as_view(), name='stock-list'),
    path('<str:symbol>/', views.StockDetailView.as_view(), name='stock-detail'),
    path('<str:symbol>/history/', views.StockHistoryView.as_view(), name='stock-history'),
    path('categories/', views.StockCategoriesView.as_view(), name='stock-categories'),
    path('gainers/', views.StockGainersView.as_view(), name='stock-gainers'),
    path('losers/', views.StockLosersView.as_view(), name='stock-losers'),
    path('trending/', views.StockTrendingView.as_view(), name='stock-trending'),
    path('admin/create/', views.StockCreateUpdateView.as_view(), name='stock-create'),
    path('admin/<int:pk>/update/', views.StockCreateUpdateView.as_view(), name='stock-update'),
    path('admin/<int:pk>/delete/', views.StockDeleteView.as_view(), name='stock-delete'),
]