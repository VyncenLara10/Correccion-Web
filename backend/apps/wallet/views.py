from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_balance(request):
    # El balance está en el modelo User directamente
    return Response({
        'balance': float(request.user.balance),
        'currency': 'GTQ'
    })