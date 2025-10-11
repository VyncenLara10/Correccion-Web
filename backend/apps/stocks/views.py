from rest_framework import generics, filters, permissions
from .models import Stock
from .serializers import StockSerializer
from apps.users.permissions import IsAdminUser

class StockListView(generics.ListAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["symbol", "name", "category"]
    ordering_fields = ["current_price", "last_updated"]
    permission_classes = [permissions.AllowAny]

class StockDetailView(generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.AllowAny]

class StockCreateUpdateView(generics.CreateAPIView, generics.UpdateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class StockDeleteView(generics.DestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
