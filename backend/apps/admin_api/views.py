from django.db import models
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.users.models import User
from apps.stocks.models import Stock
from rest_framework.views import APIView
from apps.transactions.models import Transaction
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
        new_status = request.data.get("status")
        if new_status not in ["active", "inactive"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = new_status == "active"

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

class AdminDashboardReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users_count = User.objects.count()
        stocks_count = Stock.objects.count()
        transactions_count = Transaction.objects.count()

        data = {
            "total_users": users_count,
            "total_stocks": stocks_count,
            "total_transactions": transactions_count,
        }
        return Response(data)

class AdminTransactionsReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_transactions = Transaction.objects.count()

        status_counts = (
            Transaction.objects.values("status")
            .order_by("status")
            .annotate(count=models.Count("status"))
        )

        total_amount = Transaction.objects.aggregate(total=models.Sum("amount"))["total"] or 0

        data = {
            "total_transactions": total_transactions,
            "status_breakdown": list(status_counts),
            "total_amount_invested": total_amount,
        }
        return Response(data)

class AdminUsersReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()

        roles_breakdown = (
            User.objects.values("role")
            .order_by("role")
            .annotate(count=models.Count("role"))
        )

        data = {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "roles_breakdown": list(roles_breakdown),
        }
        return Response(data)