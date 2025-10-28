from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Transaction
from .serializers import TransactionSerializer
from apps.stocks.models import Stock


class TransactionListView(generics.ListAPIView):
    """Lista de transacciones del usuario"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(user=user).select_related('stock').order_by('-created_at')


class TransactionCreateView(generics.CreateAPIView):
    """Crear transaccion generica"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetailView(generics.RetrieveAPIView):
    """Detalle de una transaccion"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(user=user)


class BuyStockView(APIView):
    """Comprar acciones"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        stock_id = request.data.get('stock_id')
        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            return Response({'error': 'Cantidad invalida'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = Stock.objects.get(id=stock_id)
        except Stock.DoesNotExist:
            return Response({'error': 'Accion no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        if not stock.is_active:
            return Response({'error': 'Accion no disponible'}, status=status.HTTP_400_BAD_REQUEST)

        if stock.available_quantity < quantity:
            return Response({'error': 'Cantidad no disponible'}, status=status.HTTP_400_BAD_REQUEST)

        total_cost = stock.current_price * quantity
        commission = total_cost * 0.01
        total_amount = total_cost + commission

        if user.balance < total_amount:
            return Response({'error': 'Saldo insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

        user.balance -= total_amount
        user.save()

        stock.available_quantity -= quantity
        stock.save()

        transaction = Transaction.objects.create(
            user=user,
            stock=stock,
            transaction_type='buy',
            quantity=quantity,
            price_per_share=stock.current_price,
            commission=commission,
            total_amount=total_amount,
            status='completed'
        )

        return Response({
            'message': 'Compra exitosa',
            'transaction': TransactionSerializer(transaction).data,
            'new_balance': float(user.balance)
        }, status=status.HTTP_201_CREATED)


class SellStockView(APIView):
    """Vender acciones"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        stock_id = request.data.get('stock_id')
        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            return Response({'error': 'Cantidad invalida'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = Stock.objects.get(id=stock_id)
        except Stock.DoesNotExist:
            return Response({'error': 'Accion no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        user_holdings = Transaction.objects.filter(
            user=user,
            stock=stock,
            transaction_type='buy',
            status='completed'
        ).aggregate(total=Sum('quantity'))['total'] or 0

        user_sold = Transaction.objects.filter(
            user=user,
            stock=stock,
            transaction_type='sell',
            status='completed'
        ).aggregate(total=Sum('quantity'))['total'] or 0

        available = user_holdings - user_sold

        if available < quantity:
            return Response({'error': 'No tienes suficientes acciones'}, status=status.HTTP_400_BAD_REQUEST)

        total_sale = stock.current_price * quantity
        commission = total_sale * 0.01
        total_amount = total_sale - commission

        user.balance += total_amount
        user.save()

        stock.available_quantity += quantity
        stock.save()

        transaction = Transaction.objects.create(
            user=user,
            stock=stock,
            transaction_type='sell',
            quantity=quantity,
            price_per_share=stock.current_price,
            commission=commission,
            total_amount=total_amount,
            status='completed'
        )

        return Response({
            'message': 'Venta exitosa',
            'transaction': TransactionSerializer(transaction).data,
            'new_balance': float(user.balance)
        }, status=status.HTTP_201_CREATED)


class TransactionStatsView(APIView):
    """Estadisticas de transacciones del usuario"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        transactions = Transaction.objects.filter(user=user, status='completed')
        
        total_transactions = transactions.count()
        
        total_bought = transactions.filter(
            transaction_type='buy'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        total_sold = transactions.filter(
            transaction_type='sell'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        total_commission = transactions.aggregate(
            total=Sum('commission')
        )['total'] or 0
        
        recent_transactions = transactions.order_by('-created_at')[:5]
        
        return Response({
            'total_transactions': total_transactions,
            'total_invested': float(total_bought),
            'total_received': float(total_sold),
            'total_commission': float(total_commission),
            'net_investment': float(total_bought - total_sold),
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data
        })