from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.stocks.models import Stock

class WatchlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response([{"id": s.id, "symbol": s.symbol} for s in request.user.watchlist.all()])

class ToggleWatchlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, stock_id):
        stock = Stock.objects.get(id=stock_id)
        if stock in request.user.watchlist.all():
            request.user.watchlist.remove(stock)
            action = "removed"
        else:
            request.user.watchlist.add(stock)
            action = "added"
        return Response({"message": f"Stock {action}"})
