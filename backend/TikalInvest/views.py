from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Avg, F, Q 
from TikalInvest.auth import Auth0JWTAuthentication
from rest_framework import exceptions
from apps.transactions.models import Transaction
from apps.stocks.models import Stock

User = get_user_model()


@api_view(['POST'])
@permission_classes([])
def verify_auth0_user(request):
    """
    Endpoint para que Next.js verifique o cree el usuario en Django
    """
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        auth = Auth0JWTAuthentication()
        
        class MockRequest:
            def __init__(self, token):
                self.headers = {'Authorization': f'Bearer {token}'}
        
        mock_request = MockRequest(token)
        result = auth.authenticate(mock_request)
        
        if result is None:
            return Response({'error': 'Autenticacion fallida'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user, _ = result
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': user.role,
                'balance': float(user.balance),
                'referral_code': user.referral_code,
                'is_verified': user.is_verified,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None
            },
            'message': 'Usuario verificado exitosamente en Django'
        })
        
    except exceptions.AuthenticationFailed as e:
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': f'Error del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Obtener perfil completo del usuario
    """
    user = request.user
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'role': user.role,
            'balance': float(user.balance),
            'referral_code': user.referral_code,
            'is_verified': user.is_verified,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_data(request):
    """
    Obtener datos completos del portfolio del usuario
    """
    user = request.user
    
    # Obtener transacciones de compra completadas
    buy_transactions = Transaction.objects.filter(
        user=user,
        transaction_type='buy',
        status='completed'
    ).select_related('stock')
    
    # Obtener transacciones de venta completadas
    sell_transactions = Transaction.objects.filter(
        user=user,
        transaction_type='sell',
        status='completed'
    ).select_related('stock')
    
    # Calcular holdings
    holdings = {}
    
    for tx in buy_transactions:
        stock_id = tx.stock.id
        if stock_id not in holdings:
            holdings[stock_id] = {
                'stock': tx.stock,
                'quantity': 0,
                'total_cost': 0,
                'transactions': []
            }
        holdings[stock_id]['quantity'] += tx.quantity
        holdings[stock_id]['total_cost'] += float(tx.total_amount)
        holdings[stock_id]['transactions'].append(tx)
    
    for tx in sell_transactions:
        stock_id = tx.stock.id
        if stock_id in holdings:
            holdings[stock_id]['quantity'] -= tx.quantity
            holdings[stock_id]['total_cost'] -= float(tx.total_amount)
    
    # Calcular valores actuales y preparar respuesta
    portfolio_items = []
    total_value = 0
    total_invested = 0
    total_pl = 0
    
    for stock_id, data in holdings.items():
        if data['quantity'] > 0:
            stock = data['stock']
            current_value = float(stock.current_price) * data['quantity']
            avg_price = data['total_cost'] / data['quantity'] if data['quantity'] > 0 else 0
            profit_loss = current_value - data['total_cost']
            profit_loss_percent = (profit_loss / data['total_cost'] * 100) if data['total_cost'] > 0 else 0
            
            portfolio_items.append({
                'stock_id': stock.id,
                'symbol': stock.symbol,
                'name': stock.name,
                'quantity': data['quantity'],
                'avg_price': round(avg_price, 2),
                'current_price': float(stock.current_price),
                'total_value': round(current_value, 2),
                'profit_loss': round(profit_loss, 2),
                'profit_loss_percent': round(profit_loss_percent, 2),
                'change_percent': float(stock.change_percent) if hasattr(stock, 'change_percent') else 0
            })
            
            total_value += current_value
            total_invested += data['total_cost']
            total_pl += profit_loss
    
    # Calcular cambio diario (estimado)
    daily_change = total_value * 0.02  # Placeholder, ajustar con logica real
    daily_change_percent = (daily_change / total_value * 100) if total_value > 0 else 0
    
    portfolio_summary = {
        'total_value': round(total_value + float(user.balance), 2),
        'available_balance': float(user.balance),
        'invested_amount': round(total_invested, 2),
        'current_holdings_value': round(total_value, 2),
        'daily_change': round(daily_change, 2),
        'daily_change_percent': round(daily_change_percent, 2),
        'total_pl': round(total_pl, 2),
        'total_pl_percent': round((total_pl / total_invested * 100) if total_invested > 0 else 0, 2),
        'holdings': portfolio_items,
        'holdings_count': len(portfolio_items)
    }
    
    return Response({
        'portfolio': portfolio_summary,
        'user_balance': float(user.balance)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_summary(request):
    """
    Resumen rapido del portfolio
    """
    user = request.user
    
    # Calcular totales
    buy_total = Transaction.objects.filter(
        user=user,
        transaction_type='buy',
        status='completed'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    sell_total = Transaction.objects.filter(
        user=user,
        transaction_type='sell',
        status='completed'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    net_invested = float(buy_total) - float(sell_total)
    
    # Obtener numero de holdings activos
    holdings = Transaction.objects.filter(
        user=user,
        status='completed'
    ).values('stock').annotate(
        net_quantity=Sum(
            F('quantity'),
            filter=Q(transaction_type='buy')
        ) - Sum(
            F('quantity'),
            filter=Q(transaction_type='sell')
        )
    ).filter(net_quantity__gt=0).count()
    
    return Response({
        'total_invested': round(net_invested, 2),
        'available_balance': float(user.balance),
        'total_holdings': holdings,
        'total_value': round(net_invested + float(user.balance), 2)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_stats(request):
    """
    Estadisticas detalladas del portfolio
    """
    user = request.user
    
    # Transacciones completadas
    transactions = Transaction.objects.filter(user=user, status='completed')
    
    total_transactions = transactions.count()
    total_bought = transactions.filter(transaction_type='buy').count()
    total_sold = transactions.filter(transaction_type='sell').count()
    
    # Montos
    amount_bought = transactions.filter(transaction_type='buy').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    amount_sold = transactions.filter(transaction_type='sell').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    total_commission = transactions.aggregate(total=Sum('commission'))['total'] or 0
    
    # Stock mas transado
    most_traded = transactions.values('stock__symbol', 'stock__name').annotate(
        count=Sum('quantity')
    ).order_by('-count').first()
    
    return Response({
        'total_transactions': total_transactions,
        'total_bought': total_bought,
        'total_sold': total_sold,
        'amount_invested': float(amount_bought),
        'amount_received': float(amount_sold),
        'net_investment': float(amount_bought) - float(amount_sold),
        'total_commission': float(total_commission),
        'most_traded_stock': most_traded if most_traded else None
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_history(request):
    """
    Historial del portfolio
    """
    user = request.user
    
    # Obtener parametros
    period = request.query_params.get('period', '1M')
    
    # Obtener transacciones recientes
    transactions = Transaction.objects.filter(
        user=user,
        status='completed'
    ).select_related('stock').order_by('-created_at')[:50]
    
    history_data = [{
        'date': tx.created_at.isoformat(),
        'type': tx.transaction_type,
        'stock_symbol': tx.stock.symbol,
        'stock_name': tx.stock.name,
        'quantity': tx.quantity,
        'price': float(tx.price_per_share),
        'total': float(tx.total_amount),
        'commission': float(tx.commission)
    } for tx in transactions]
    
    return Response({
        'period': period,
        'history': history_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_referral_code(request):
    """
    Usar un codigo de referido
    """
    referral_code = request.data.get('referral_code')
    user = request.user
    
    if not referral_code:
        return Response({'error': 'Codigo de referido requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if user.referral_code == referral_code:
            return Response({'error': 'No puedes usar tu propio codigo de referido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(user, 'referred_by') and user.referred_by:
            return Response({'error': 'Ya has usado un codigo de referido anteriormente'}, status=status.HTTP_400_BAD_REQUEST)
        
        referrer = User.objects.get(referral_code=referral_code)
        
        user.referred_by = referrer
        user.balance += 100.00
        user.save()
        
        referrer.balance += 50.00
        referrer.save()
        
        return Response({
            'success': True,
            'message': 'Codigo de referido aplicado exitosamente',
            'bonus_received': 100.00,
            'referrer_name': f"{referrer.first_name} {referrer.last_name}".strip(),
            'new_balance': float(user.balance)
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Codigo de referido invalido'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)