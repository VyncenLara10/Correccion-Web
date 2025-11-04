import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class StockTransaction(models.Model):
    """Modelo para registrar compras y ventas de acciones"""
    TRANSACTION_TYPE_CHOICES = [
        ('buy', 'Compra'),
        ('sell', 'Venta'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_transactions')
    symbol = models.CharField(max_length=10, db_index=True)  # AAPL, GOOGL, etc
    name = models.CharField(max_length=255)  # Nombre de la empresa
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    shares = models.DecimalField(max_digits=15, decimal_places=4)  # Cantidad de acciones
    price_per_share = models.DecimalField(max_digits=15, decimal_places=2)  # Precio unitario
    total = models.DecimalField(max_digits=15, decimal_places=2)  # Total (shares * price_per_share)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stock_transactions'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'symbol']),
            models.Index(fields=['user', 'transaction_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.transaction_type.upper()} {self.shares} {self.symbol} @ ${self.price_per_share}"
    
    def save(self, *args, **kwargs):
        """Calcula automáticamente el total antes de guardar"""
        if not self.total:
            self.total = self.shares * self.price_per_share
        super().save(*args, **kwargs)


class Portfolio(models.Model):
    """Modelo para almacenar acciones del portafolio del usuario"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'portfolios'
    
    def __str__(self):
        return f"Portfolio de {self.user.email}"
    
    def get_total_invested(self) -> Decimal:
        """Calcula la inversión total (compras - ventas)"""
        transactions = self.user.stock_transactions.filter(status='completed')
        total = Decimal('0')
        for transaction in transactions:
            if transaction.transaction_type == 'buy':
                total += transaction.total
            else:  # sell
                total -= transaction.total
        return total
    
    def get_current_value(self) -> Decimal:
        """Calcula el valor actual del portafolio basado en el precio actual de cada acción"""
        # Por ahora retorna la inversión total
        # En una implementación real, traería los precios actuales de Yahoo Finance
        return self.get_total_invested()
    
    def get_total_gains(self) -> Decimal:
        """Calcula las ganancias totales (valor actual - inversión)"""
        return self.get_current_value() - self.get_total_invested()
    
    def get_portfolio_holdings(self) -> dict:
        """Retorna las acciones actuales agrupadas por símbolo"""
        transactions = self.user.stock_transactions.filter(status='completed').order_by('symbol')
        holdings = {}
        
        for transaction in transactions:
            if transaction.symbol not in holdings:
                holdings[transaction.symbol] = {
                    'symbol': transaction.symbol,
                    'name': transaction.name,
                    'shares': Decimal('0'),
                    'average_price': Decimal('0'),
                    'total_invested': Decimal('0'),
                }
            
            holding = holdings[transaction.symbol]
            if transaction.transaction_type == 'buy':
                # Actualizar promedio de precio
                old_total = holding['total_invested']
                new_total = old_total + transaction.total
                old_shares = holding['shares']
                new_shares = old_shares + transaction.shares
                
                if new_shares > 0:
                    holding['average_price'] = new_total / new_shares
                
                holding['total_invested'] = new_total
                holding['shares'] = new_shares
            else:  # sell
                holding['shares'] = max(Decimal('0'), holding['shares'] - transaction.shares)
                # Restamos proporcionalmente la inversión
                if holding['shares'] == 0:
                    holding['total_invested'] = Decimal('0')
                else:
                    holding['total_invested'] -= transaction.total
        
        # Filtrar holdings sin acciones
        return {k: v for k, v in holdings.items() if v['shares'] > 0}
