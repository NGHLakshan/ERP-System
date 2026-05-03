from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseOrder
from apps.inventory.models import Stock, StockMovement, Warehouse


@receiver(post_save, sender=PurchaseOrder)
def handle_purchase_received(sender, instance, **kwargs):
    """
    When a PurchaseOrder status changes to 'received':
    - Create a StockMovement (IN) for each item
    - Update (or create) the Stock record for each product
    - Auto-create Finance EXPENSE record
    """
    if instance.status == 'received':
        # Get or create a default warehouse
        warehouse, _ = Warehouse.objects.get_or_create(
            name='Main Warehouse',
            defaults={'location': 'Default'}
        )

        for item in instance.items.all():
            # Create a stock movement record
            StockMovement.objects.get_or_create(
                reference=f"PO-{instance.id}-ITEM-{item.id}",
                defaults={
                    'product': item.product,
                    'warehouse': warehouse,
                    'quantity': item.quantity,
                    'movement_type': 'IN',
                }
            )

            # Update stock quantity
            stock, created = Stock.objects.get_or_create(
                product=item.product,
                warehouse=warehouse,
                defaults={'quantity': 0}
            )
            if created:
                stock.quantity = item.quantity
            else:
                stock.quantity += item.quantity
            stock.save()

        # ✅ Auto-create Finance EXPENSE record
        from apps.finance.models import Transaction
        supplier_name = str(instance.supplier) if instance.supplier else 'Unknown Supplier'
        Transaction.objects.get_or_create(
            reference=f"PO-{instance.id}",
            type='EXPENSE',
            defaults={
                'amount': instance.total_amount,
                'description': f"Purchase received — {supplier_name} (PO-{instance.id})",
            }
        )
