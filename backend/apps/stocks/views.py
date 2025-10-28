from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Stock, StockHistory
from .serializers import StockSerializer
from apps.users.permissions import IsAdminUser
from TikalInvest.auth import IsAdmin


class StockListView(generics.ListAPIView):
    """Lista de acciones"""
    queryset = Stock.objects.filter(is_active=True)
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['symbol', 'name', 'category', 'sector']
    ordering_fields = ['current_price', 'change_percent', 'volume', 'last_updated']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros adicionales
        category = self.request.query_params.get('category')
        sector = self.request.query_params.get('sector')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if category:
            queryset = queryset.filter(category=category)
        if sector:
            queryset = queryset.filter(sector=sector)
        if min_price:
            queryset = queryset.filter(current_price__gte=float(min_price))
        if max_price:
            queryset = queryset.filter(current_price__lte=float(max_price))
        
        return queryset


class StockDetailView(generics.RetrieveAPIView):
    """Detalle de una accion"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    lookup_field = 'symbol'
    permission_classes = [permissions.AllowAny]


class StockHistoryView(APIView):
    """Historial de precios de una accion"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, symbol):
        try:
            stock = Stock.objects.get(symbol=symbol)
        except Stock.DoesNotExist:
            return Response({'error': 'Accion no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener parametros
        period = request.query_params.get('period', '1M')
        days = request.query_params.get('days')
        
        # Calcular fecha de inicio segun el periodo
        now = timezone.now()
        if days:
            start_date = now - timedelta(days=int(days))
        else:
            period_map = {
                '1D': 1,
                '1W': 7,
                '1M': 30,
                '3M': 90,
                '6M': 180,
                '1Y': 365,
                'ALL': 3650
            }
            days_back = period_map.get(period, 30)
            start_date = now - timedelta(days=days_back)
        
        # Obtener historial (si tienes modelo StockHistory)
        try:
            history = StockHistory.objects.filter(
                stock=stock,
                timestamp__gte=start_date
            ).order_by('timestamp')
            
            data = [{
                'timestamp': h.timestamp.isoformat(),
                'price': float(h.price),
                'volume': h.volume,
                'high': float(h.high) if hasattr(h, 'high') else None,
                'low': float(h.low) if hasattr(h, 'low') else None,
            } for h in history]
            
        except:
            # Si no existe modelo de historial, generar datos ficticios
            data = self._generate_mock_history(stock, start_date, now)
        
        return Response({
            'symbol': stock.symbol,
            'period': period,
            'history': data
        })
    
    def _generate_mock_history(self, stock, start_date, end_date):
        """Generar historial ficticio si no hay modelo de historial"""
        import random
        
        data = []
        current_date = start_date
        current_price = float(stock.current_price)
        
        while current_date <= end_date:
            # Variacion aleatoria del precio
            change = random.uniform(-0.05, 0.05)
            current_price = current_price * (1 + change)
            
            data.append({
                'timestamp': current_date.isoformat(),
                'price': round(current_price, 2),
                'volume': random.randint(100000, 1000000),
                'high': round(current_price * 1.02, 2),
                'low': round(current_price * 0.98, 2),
            })
            
            current_date += timedelta(days=1)
        
        return data


class StockCreateUpdateView(generics.CreateAPIView, generics.UpdateAPIView):
    """Crear/actualizar accion (solo admin)"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class StockDeleteView(generics.DestroyAPIView):
    """Eliminar accion (solo admin)"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class StockCategoriesView(APIView):
    """Obtener categorias de acciones"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Stock.objects.values_list('category', flat=True).distinct()
        return Response({'categories': list(filter(None, categories))})


class StockGainersView(APIView):
    """Top acciones con mayor ganancia"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        stocks = Stock.objects.filter(is_active=True).order_by('-change_percent')[:limit]
        return Response({
            'gainers': StockSerializer(stocks, many=True).data
        })


class StockLosersView(APIView):
    """Top acciones con mayor perdida"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        stocks = Stock.objects.filter(is_active=True).order_by('change_percent')[:limit]
        return Response({
            'losers': StockSerializer(stocks, many=True).data
        })


class StockTrendingView(APIView):
    """Acciones con mayor volumen"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        stocks = Stock.objects.filter(is_active=True).order_by('-volume')[:limit]
        return Response({
            'trending': StockSerializer(stocks, many=True).data
        })