from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from .models import Referral

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_list(request):
    referrals = Referral.objects.filter(referrer=request.user).select_related('referred_user')
    data = [{
        'id': ref.id,
        'referred_user': {
            'id': ref.referred_user.id,
            'name': f"{ref.referred_user.first_name} {ref.referred_user.last_name}".strip() or ref.referred_user.username,
            'email': ref.referred_user.email,
            'username': ref.referred_user.username
        },
        'status': ref.status,
        'earnings_generated': float(ref.earnings_generated),
        'created_at': ref.created_at.isoformat() if ref.created_at else None,
        'activated_at': ref.activated_at.isoformat() if ref.activated_at else None
    } for ref in referrals]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_stats(request):
    total_referrals = Referral.objects.filter(referrer=request.user).count()
    active_referrals = Referral.objects.filter(referrer=request.user, status='active').count()
    pending_referrals = Referral.objects.filter(referrer=request.user, status='pending').count()
    total_commission = Referral.objects.filter(referrer=request.user).aggregate(
        total=Sum('earnings_generated')
    )['total'] or 0
    
    return Response({
        'total_referrals': total_referrals,
        'active_referrals': active_referrals,
        'pending_referrals': pending_referrals,
        'total_earnings': float(total_commission),
        'pending_earnings': 0
    })