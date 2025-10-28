from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .tasks import generate_user_report
from django.contrib.auth import get_user_model

User = get_user_model()

class RequestReportView(APIView):
    """
    Endpoint to request a report
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        generate_user_report.delay(user.id, start_date, end_date)

        return Response({"message": "Tu reporte está siendo generado y será enviado por correo."}, status=status.HTTP_200_OK)