from rest_framework import generics, permissions, status
from rest_framework.response import Response
from users.models import User
from stocks.models import Stock
from transactions.models import Transaction
from TikalInvest.auth import IsAdmin
from .serializers import UserSerializer, StockSerializer, TransactionSerializer

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class AdminUserStatusView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        status = request.data.get("status")
        if status not in ["active", "inactive"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = status == "active"
        user.save()
        return Response({"message": "Status updated"})

class AdminStockListCreateView(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAdmin]

class AdminStockDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAdmin]

class AdminStockToggleActiveView(generics.UpdateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        stock = self.get_object()
        stock.is_active = not stock.is_active
        stock.save()
        return Response({"message": "Toggled active status", "is_active": stock.is_active})

class AdminTransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAdmin]

class AdminTransactionStatusView(generics.UpdateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        transaction = self.get_object()
        new_status = request.data.get("status")
        transaction.status = new_status
        transaction.save()
        return Response({"message": "Transaction status updated"})
