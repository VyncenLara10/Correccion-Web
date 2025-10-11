from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from apps.transactions.models import Transaction
from decimal import Decimal

User = get_user_model()

@shared_task
def generate_user_report(user_id, start_date=None, end_date=None):
    """
    Genera el reporte de un usuario y lo envía por correo.
    start_date y end_date opcionales para filtrar historial.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return f"Usuario {user_id} no encontrado"

    transactions = Transaction.objects.filter(user=user)
    
    if start_date:
        transactions = transactions.filter(timestamp__gte=start_date)
    if end_date:
        transactions = transactions.filter(timestamp__lte=end_date)

    total_buy = sum(tx.total for tx in transactions if tx.transaction_type == "buy")
    total_sell = sum(tx.total for tx in transactions if tx.transaction_type == "sell")
    profit_loss = total_sell - total_buy

    message = f"Hola {user.username},\n\n"
    message += f"Reporte de transacciones:\n"
    for tx in transactions:
        message += f"- {tx.transaction_type} {tx.quantity or ''} {tx.stock.symbol if tx.stock else ''} @ {tx.price or tx.total} total={tx.total}\n"

    message += f"\nTotal comprado: ${total_buy}\n"
    message += f"Total vendido: ${total_sell}\n"
    message += f"Ganancia / Pérdida: ${profit_loss}\n"
    message += f"Saldo actual: ${user.balance}\n\nGracias por usar TikalInvest."

    send_mail(
        subject="Tu reporte de transacciones",
        message=message,
        from_email="noreply@tikalinvest.com",
        recipient_list=[user.email],
        fail_silently=False,
    )

    return f"Reporte enviado a {user.email}"
