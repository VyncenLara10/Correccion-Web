from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.users.models import UserBalance, DepositTransaction
from apps.portfolio.models import StockTransaction
from apps.users.serializers import UserSerializer, UserBalanceSerializer

User = get_user_model()


class IsAdmin(BasePermission):
    """Permiso para verificar si el usuario es administrador"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class AdminViewSet(viewsets.ModelViewSet):
    """ViewSet para panel de administración"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Obtiene estadísticas generales del dashboard"""
        total_users = User.objects.filter(status='active').count()
        total_transactions = StockTransaction.objects.filter(status='completed').count()
        
        # Volumen total de trading
        total_volume = StockTransaction.objects.filter(status='completed').aggregate(
            total=Sum('total')
        )['total'] or Decimal('0.0')
        
        # Usuarios activos en el último mes
        last_month = timezone.now() - timedelta(days=30)
        active_users_month = User.objects.filter(
            created_at__gte=last_month,
            status='active'
        ).count()
        
        # Transacciones de hoy
        today = timezone.now().date()
        transactions_today = StockTransaction.objects.filter(
            created_at__date=today,
            status='completed'
        ).count()
        
        # Usuarios activos (con al menos una transacción en el último mes)
        active_users = User.objects.filter(
            stock_transactions__created_at__gte=last_month
        ).distinct().count()
        
        return Response({
            'total_users': total_users,
            'total_volume': float(total_volume),
            'transactions_today': transactions_today,
            'active_users': active_users,
            'new_users_this_month': active_users_month,
        })
    
    @action(detail=False, methods=['get'])
    def trading_volume_data(self, request):
        """Obtiene datos de volumen de trading por mes"""
        from dateutil.relativedelta import relativedelta
        
        data = []
        current_date = timezone.now().replace(day=1)
        
        months_labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        
        # Últimos 6 meses
        for i in range(6):
            month_start = current_date - relativedelta(months=5-i)
            month_end = month_start + relativedelta(months=1)
            
            volume = StockTransaction.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end,
                status='completed'
            ).aggregate(
                total=Sum('total')
            )['total'] or Decimal('0.0')
            
            data.append({
                'month': months_labels[month_start.month - 1],
                'volume': float(volume)
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def new_users_data(self, request):
        """Obtiene datos de nuevos usuarios por mes"""
        from dateutil.relativedelta import relativedelta
        
        data = []
        current_date = timezone.now().replace(day=1)
        
        months_labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        
        # Últimos 6 meses
        for i in range(6):
            month_start = current_date - relativedelta(months=5-i)
            month_end = month_start + relativedelta(months=1)
            
            users_count = User.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
            
            data.append({
                'month': months_labels[month_start.month - 1],
                'users': users_count
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def users_list(self, request):
        """Obtiene lista de usuarios con su información"""
        users = User.objects.filter(status='active').annotate(
            trades_count=Count('stock_transactions'),
            balance=Sum('user_balance__balance')
        ).values(
            'id', 'email', 'first_name', 'last_name', 'status',
            'created_at', 'trades_count', 'balance'
        )
        
        # Mapear datos
        users_data = []
        for user in users:
            users_data.append({
                'id': str(user['id']),
                'name': f"{user['first_name']} {user['last_name']}".strip() or user['email'].split('@')[0],
                'email': user['email'],
                'balance': float(user['balance'] or 0),
                'trades': user['trades_count'],
                'status': user['status'],
            })
        
        return Response(users_data)
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Obtiene actividad reciente del sistema"""
        # Últimas 10 transacciones
        transactions = StockTransaction.objects.filter(
            status='completed'
        ).select_related('user').order_by('-created_at')[:10]
        
        activity = []
        for tx in transactions:
            action_type = 'Compra' if tx.transaction_type == 'buy' else 'Venta'
            activity.append({
                'user': f"{tx.user.first_name} {tx.user.last_name}".strip() or tx.user.email,
                'action': f"{action_type} de {tx.symbol}",
                'amount': f"${tx.total:,.2f}",
                'time': tx.created_at.isoformat(),
                'symbol': tx.symbol,
                'type': tx.transaction_type,
            })
        
        return Response(activity)
    
    @action(detail=False, methods=['post'])
    def suspend_user(self, request):
        """Suspender un usuario"""
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            user.status = 'suspended'
            user.save()
            return Response({'status': 'success', 'message': 'Usuario suspendido'})
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def activate_user(self, request):
        """Activar un usuario"""
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            user.status = 'active'
            user.save()
            return Response({'status': 'success', 'message': 'Usuario activado'})
        except User.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def transactions_detailed(self, request):
        """Obtiene lista detallada de todas las transacciones"""
        transactions = StockTransaction.objects.filter(
            status='completed'
        ).select_related('user').order_by('-created_at')[:50]
        
        data = []
        for tx in transactions:
            data.append({
                'id': str(tx.id),
                'user': f"{tx.user.first_name} {tx.user.last_name}".strip() or tx.user.email,
                'email': tx.user.email,
                'action': 'Compra' if tx.transaction_type == 'buy' else 'Venta',
                'symbol': tx.symbol,
                'name': tx.name,
                'shares': float(tx.shares),
                'price_per_share': float(tx.price_per_share),
                'total': float(tx.total),
                'type': tx.transaction_type,
                'timestamp': tx.created_at.isoformat(),
                'status': tx.status,
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def today_revenue(self, request):
        """Obtiene los ingresos de hoy (total de todas las transacciones completadas)"""
        # Obtener todas las transacciones completadas sin filtro de fecha
        revenue = StockTransaction.objects.filter(
            status='completed'
        ).aggregate(
            total=Sum('total')
        )['total'] or Decimal('0.0')
        
        transaction_count = StockTransaction.objects.filter(
            status='completed'
        ).count()
        
        buy_count = StockTransaction.objects.filter(
            status='completed',
            transaction_type='buy'
        ).count()
        
        sell_count = StockTransaction.objects.filter(
            status='completed',
            transaction_type='sell'
        ).count()
        
        return Response({
            'revenue': float(revenue),
            'transaction_count': transaction_count,
            'buy_count': buy_count,
            'sell_count': sell_count,
            'date': str(timezone.now().date())
        })
