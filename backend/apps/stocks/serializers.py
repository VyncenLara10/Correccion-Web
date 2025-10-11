from rest_framework import serializers
from .models import Stock, StockHistory

class StockHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHistory
        fields = ["id", "price", "timestamp"]

class StockSerializer(serializers.ModelSerializer):
    history = StockHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Stock
        fields = ["id", "symbol", "name", "category", "current_price", "last_updated", "history"]
