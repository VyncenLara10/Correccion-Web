from rest_framework import serializers
from .models import Transaction
from apps.stocks.models import Stock

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "user", "stock", "transaction_type", "quantity", "price", "total",
            "reference_code", "timestamp"
        ]
        read_only_fields = ["price", "total", "timestamp"]

    def validate(self, data):
        user = self.context["request"].user
        tx_type = data.get("transaction_type")
        quantity = data.get("quantity", 0)
        stock = data.get("stock", None)

        if tx_type in ["buy", "sell"] and not stock:
            raise serializers.ValidationError("Se requiere una acción para comprar o vender.")

        if tx_type == "buy" and stock and quantity:
            total_cost = stock.current_price * quantity
            if user.balance < total_cost:
                raise serializers.ValidationError("Saldo insuficiente para realizar la compra.")

        if tx_type == "sell" and stock and quantity:
            # Add inventary logic
            pass

        return data
