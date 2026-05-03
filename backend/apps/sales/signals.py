from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SalesOrder
from apps.inventory.models import Stock, StockMovement, Warehouse


@receiver(post_save, sender=SalesOrder)
def handle_sales_order_status_change(sender, instance, created, **kwargs):
    """
    When a SalesOrder status changes:
    - If confirmed: Create StockMovement (OUT), deduct Stock, create Finance INCOME record
    - If cancelled: Create StockMovement (IN) and increase Stock (to revert)
    """
    if instance.status == 'confirmed':
        # Default warehouse
        warehouse, _ = Warehouse.objects.get_or_create(
            name='Main Warehouse',
            defaults={'location': 'Default'}
        )

        for item in instance.items.all():
            # Create a stock movement record (OUT)
            StockMovement.objects.create(
                product=item.product,
                warehouse=warehouse,
                quantity=item.quantity,
                movement_type='OUT',
                reference=f"SO-{instance.id}-ITEM-{item.id}"
            )

            # Update stock quantity (deduct)
            stock, stock_created = Stock.objects.get_or_create(
                product=item.product,
                warehouse=warehouse,
                defaults={'quantity': 0}
            )
            stock.quantity -= item.quantity
            stock.save()

        # ✅ Auto-create Finance INCOME record
        from apps.finance.models import Transaction
        customer_name = str(instance.customer) if instance.customer else 'Unknown Customer'
        Transaction.objects.get_or_create(
            reference=f"SO-{instance.id}",
            type='INCOME',
            defaults={
                'amount': instance.total_amount,
                'description': f"Sale confirmed — {customer_name} (SO-{instance.id})",
            }
        )

    elif instance.status == 'cancelled':
        # Only revert if we are cancelling an order that was previously confirmed
        if not getattr(instance, '_was_confirmed_before_cancel', False):
            return

        warehouse, _ = Warehouse.objects.get_or_create(
            name='Main Warehouse',
            defaults={'location': 'Default'}
        )

        for item in instance.items.all():
            # Create a stock movement record (IN) to revert
            StockMovement.objects.create(
                product=item.product,
                warehouse=warehouse,
                quantity=item.quantity,
                movement_type='IN',
                reference=f"SO-{instance.id}-CANCEL-{item.id}"
            )

            # Update stock quantity (add back)
            stock, stock_created = Stock.objects.get_or_create(
                product=item.product,
                warehouse=warehouse,
                defaults={'quantity': 0}
            )
            stock.quantity += item.quantity
            stock.save()
