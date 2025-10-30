from django.urls import path
from .views import TransactionListView, TransactionCreateView, TransactionDetailView

urlpatterns = [
    path("", TransactionListView.as_view(), name="transaction_list"),
    path("create/", TransactionCreateView.as_view(), name="transaction_create"),
    path("<int:pk>/", TransactionDetailView.as_view(), name="transaction_detail"),
]
