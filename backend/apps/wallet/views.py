from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import WalletTransaction

class WalletBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"balance": request.user.balance})

class DepositView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = float(request.data.get("amount", 0))
        method = request.data.get("payment_method")
        request.user.balance += amount
        request.user.save()
        WalletTransaction.objects.create(user=request.user, type="deposit", total=amount)
        return Response({"message": "Deposit successful", "balance": request.user.balance})

class WithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = float(request.data.get("amount", 0))
        account = request.data.get("bank_account")
        if request.user.balance < amount:
            return Response({"error": "Insufficient balance"}, status=400)
        request.user.balance -= amount
        request.user.save()
        WalletTransaction.objects.create(user=request.user, type="withdrawal", total=amount)
        return Response({"message": "Withdrawal successful", "balance": request.user.balance})

class WalletHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transactions = WalletTransaction.objects.filter(user=request.user).order_by("-timestamp")
        data = [{"type": t.type, "total": t.total, "created_at": t.timestamp} for t in transactions]
        return Response(data)
