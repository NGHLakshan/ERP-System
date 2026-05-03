from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'reference', 'date', 'description', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']
