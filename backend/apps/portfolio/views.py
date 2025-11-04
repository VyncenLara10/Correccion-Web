from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, Case, When, DecimalField
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import StockTransaction, Portfolio
from .serializers import (
    StockTransactionSerializer, 
    StockTransactionCreateSerializer,
    PortfolioSerializer,
    DashboardStatsSerializer
)


class StockTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar transacciones de acciones"""
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo retorna transacciones del usuario autenticado"""
        return StockTransaction.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Crear una nueva transacción"""
        serializer = StockTransactionCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Crear la transacción asociada al usuario
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtiene las últimas 5 transacciones"""
        transactions = self.get_queryset()[:5]
        serializer = StockTransactionSerializer(transactions, many=True)
        return Response({
            'success': True,
            'count': len(transactions),
            'transactions': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_symbol(self, request):
        """Obtiene transacciones filtradas por símbolo"""
        symbol = request.query_params.get('symbol')
        if not symbol:
            return Response({
                'success': False,
                'message': 'Symbol parameter required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        transactions = self.get_queryset().filter(symbol=symbol)
        serializer = StockTransactionSerializer(transactions, many=True)
        return Response({
            'success': True,
            'count': len(transactions),
            'transactions': serializer.data
        })


class PortfolioViewSet(viewsets.ModelViewSet):
    """ViewSet para manejar el portafolio del usuario"""
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo retorna el portafolio del usuario autenticado"""
        return Portfolio.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Obtiene o crea el portafolio del usuario"""
        portfolio, created = Portfolio.objects.get_or_create(user=self.request.user)
        return portfolio
    
    def retrieve(self, request, *args, **kwargs):
        """Obtiene el portafolio del usuario"""
        portfolio = self.get_object()
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Retorna estadísticas del dashboard para el usuario"""
        user = request.user
        
        # Obtener o crear portafolio
        portfolio, _ = Portfolio.objects.get_or_create(user=user)
        
        # Obtener balance del usuario
        try:
            user_balance = user.balance
            total_balance = user_balance.available_balance
        except:
            total_balance = Decimal('0')
        
        # Calcular inversiones y ganancias
        total_invested = portfolio.get_total_invested()
        total_gains = portfolio.get_total_gains()
        gains_percentage = Decimal('0')
        if total_invested > 0:
            gains_percentage = (total_gains / total_invested) * 100
        
        # Obtener últimas 5 transacciones
        recent_transactions = StockTransaction.objects.filter(
            user=user,
            status='completed'
        ).order_by('-created_at')[:5]
        
        # Generar datos para la gráfica de rendimiento (últimos 7 días)
        performance_data = []
        for i in range(6, -1, -1):
            date = timezone.now() - timedelta(days=i)
            date_str = date.strftime('%a')  # Lun, Mar, etc
            
            # Simular valor del portafolio en ese día
            # En producción, esto debería ser más sofisticado
            day_value = total_balance + (total_invested * (Decimal(i) / 6))
            performance_data.append({
                'date': date_str,
                'value': float(day_value)
            })
        
        return Response({
            'success': True,
            'stats': {
                'total_balance': float(total_balance),
                'total_invested': float(total_invested),
                'total_gains': float(total_gains),
                'gains_percentage': float(gains_percentage),
                'portfolio_value': float(total_balance + total_invested),
                'recent_transactions': StockTransactionSerializer(recent_transactions, many=True).data,
                'performance_data': performance_data
            }
        })
    
    @action(detail=False, methods=['get'])
    def holdings(self, request):
        """Retorna los holdings actuales del portafolio"""
        portfolio = self.get_object()
        holdings = portfolio.get_portfolio_holdings()
        
        return Response({
            'success': True,
            'count': len(holdings),
            'holdings': [
                {
                    'symbol': h['symbol'],
                    'name': h['name'],
                    'shares': float(h['shares']),
                    'average_price': float(h['average_price']),
                    'total_invested': float(h['total_invested']),
                }
                for h in holdings.values()
            ]
        })
