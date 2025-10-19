from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Referral

class ReferralListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        referrals = Referral.objects.filter(referred_by=request.user)
        data = [{"id": r.id, "name": r.name, "email": r.email, "status": r.status, "earnings": r.earnings} for r in referrals]
        total_earnings = sum(r.earnings for r in referrals)
        active_referrals = sum(1 for r in referrals if r.status=="active")
        return Response({"referrals": data, "total_earnings": total_earnings, "active_referrals": active_referrals})

class ReferralStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        referrals = Referral.objects.filter(referred_by=request.user)
        total_earnings = sum(r.earnings for r in referrals)
        active_referrals = sum(1 for r in referrals if r.status=="active")
        return Response({"total_earnings": total_earnings, "active_referrals": active_referrals})
