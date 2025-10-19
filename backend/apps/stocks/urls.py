from django.urls import path
from .views import StockListView, StockDetailView, StockCreateUpdateView, StockDeleteView

urlpatterns = [
    path("", StockListView.as_view(), name="stock_list"),
    path("<int:pk>/", StockDetailView.as_view(), name="stock_detail"),
    path("create/", StockCreateUpdateView.as_view(), name="stock_create"),
    path("update/<int:pk>/", StockCreateUpdateView.as_view(), name="stock_update"),
    path("delete/<int:pk>/", StockDeleteView.as_view(), name="stock_delete"),
    path("categories/", StockCategoriesView.as_view()),
    path("gainers/", StockGainersView.as_view()),
    path("losers/", StockLosersView.as_view()),
    path("trending/", StockTrendingView.as_view()),path("categories/", StockCategoriesView.as_view()),
    path("gainers/", StockGainersView.as_view()),
    path("losers/", StockLosersView.as_view()),
    path("trending/", StockTrendingView.as_view()),
]
