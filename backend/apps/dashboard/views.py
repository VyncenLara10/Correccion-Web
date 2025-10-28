from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count
from apps.users.models import User
from apps.stocks.models import Stock
from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
    
        total_stocks = Stock.objects.filter(is_active=True).count()
        total_users = User.objects.filter(is_active=True).count()
        total_transactions = Transaction.objects.filter(user=user).count()
    
        user_transactions = Transaction.objects.filter(user=user, status='completed')
        total_invested = user_transactions.filter(
            transaction_type='buy'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
    
        return Response({
            "total_stocks": total_stocks,
            "total_users": total_users,
            "total_transactions": total_transactions,
            "user_balance": float(user.balance),
            "total_invested": float(total_invested),
            "user_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        })

class DashboardRecentActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ecent_transactions = Transaction.objects.filter(
            ser=request.user
            ).select_related('stock').order_by('-created_at')[:10]
    
        return Response({
            "transactions": TransactionSerializer(recent_transactions, many=True).data
        })
