from django.shortcuts import render

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "total_stocks": Stock.objects.count(),
            "total_users": User.objects.count(),
            "total_transactions": Transaction.objects.count(),
        })

class DashboardRecentActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recent_transactions = Transaction.objects.order_by("-timestamp")[:10]
        return Response(TransactionSerializer(recent_transactions, many=True).data)
