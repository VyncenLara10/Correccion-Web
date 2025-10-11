from celery import shared_task
from .models import Stock, StockHistory
import random
from decimal import Decimal

@shared_task
def update_stock_prices():
    stocks = Stock.objects.all()
    for stock in stocks:
        change_percent = Decimal(random.uniform(-0.05, 0.05))
        new_price = max(stock.current_price * (1 + change_percent), Decimal("0.01"))
        stock.current_price = round(new_price, 2)
        stock.save()

        StockHistory.objects.create(stock=stock, price=stock.current_price)
