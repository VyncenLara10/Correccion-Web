from rest_framework import serializers
from .models import StockTransaction, Portfolio
from decimal import Decimal


class StockTransactionSerializer(serializers.ModelSerializer):
    """Serializador para transacciones de acciones"""
    class Meta:
        model = StockTransaction
        fields = ['id', 'symbol', 'name', 'transaction_type', 'shares', 'price_per_share', 'total', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear transacciones de acciones"""
    class Meta:
        model = StockTransaction
        fields = ['symbol', 'name', 'transaction_type', 'shares', 'price_per_share']
    
    def create(self, validated_data):
        """Calcula el total automáticamente"""
        shares = validated_data.get('shares')
        price = validated_data.get('price_per_share')
        validated_data['total'] = shares * price
        return super().create(validated_data)


class PortfolioHoldingSerializer(serializers.Serializer):
    """Serializador para los holdings del portafolio"""
    symbol = serializers.CharField()
    name = serializers.CharField()
    shares = serializers.DecimalField(max_digits=15, decimal_places=4)
    average_price = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_invested = serializers.DecimalField(max_digits=15, decimal_places=2)


class PortfolioSerializer(serializers.ModelSerializer):
    """Serializador para el portafolio del usuario"""
    holdings = serializers.SerializerMethodField()
    total_invested = serializers.SerializerMethodField()
    current_value = serializers.SerializerMethodField()
    total_gains = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = ['id', 'holdings', 'total_invested', 'current_value', 'total_gains', 'created_at', 'updated_at']
    
    def get_holdings(self, obj):
        """Retorna los holdings actuales"""
        holdings_dict = obj.get_portfolio_holdings()
        serializer = PortfolioHoldingSerializer(holdings_dict.values(), many=True)
        return serializer.data
    
    def get_total_invested(self, obj):
        """Retorna la inversión total"""
        return str(obj.get_total_invested())
    
    def get_current_value(self, obj):
        """Retorna el valor actual"""
        return str(obj.get_current_value())
    
    def get_total_gains(self, obj):
        """Retorna las ganancias totales"""
        return str(obj.get_total_gains())


class DashboardStatsSerializer(serializers.Serializer):
    """Serializador para estadísticas del dashboard"""
    total_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_invested = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_gains = serializers.DecimalField(max_digits=15, decimal_places=2)
    gains_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    recent_transactions = StockTransactionSerializer(many=True)
    portfolio_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    performance_data = serializers.ListField()  # Para la gráfica de rendimiento
