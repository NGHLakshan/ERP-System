from rest_framework import serializers
from .models import Customer, SalesOrder, SalesItem
from apps.inventory.serializers import ProductSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class SalesItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = SalesItem
        fields = ['id', 'product', 'product_details', 'quantity', 'price', 'subtotal']
        read_only_fields = ['subtotal']

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesItemSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = SalesOrder
        fields = ['id', 'customer', 'customer_details', 'date', 'status', 'notes', 'total_amount', 'items']
        read_only_fields = ['date', 'status', 'total_amount']

class SalesItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesItem
        fields = ['product', 'quantity', 'price']

class SalesOrderCreateSerializer(serializers.ModelSerializer):
    items = SalesItemCreateSerializer(many=True)

    class Meta:
        model = SalesOrder
        fields = ['customer', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = SalesOrder.objects.create(**validated_data)
        for item_data in items_data:
            SalesItem.objects.create(sales_order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update SalesOrder fields
        instance.customer = validated_data.get('customer', instance.customer)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        # Update items if provided (simple approach: delete existing and recreate)
        # Note: In a real production system, you'd want to update existing items if possible to preserve IDs
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SalesItem.objects.create(sales_order=instance, **item_data)
                
        return instance
