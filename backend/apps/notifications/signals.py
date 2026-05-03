from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.inventory.models import Stock, Product
from apps.sales.models import SalesOrder
from apps.purchases.models import PurchaseOrder
from .models import Notification

User = get_user_model()

def notify_staff(message):
    staff_users = User.objects.filter(role__in=['admin', 'manager'])
    for user in staff_users:
        Notification.objects.create(user=user, message=message)

@receiver(post_save, sender=Stock)
def check_low_stock(sender, instance, **kwargs):
    if instance.quantity < instance.product.reorder_level:
        message = f"Low Stock Alert: {instance.product.name} is down to {instance.quantity} units (Reorder level: {instance.product.reorder_level})."
        # Check if a notification for this product was already created recently to avoid spam
        # For now, just create it
        notify_staff(message)

@receiver(post_save, sender=SalesOrder)
def sale_confirmed_alert(sender, instance, created, **kwargs):
    # We check if status changed to 'confirmed'
    # Django signals don't easily give 'previous state', but we can check if it's currently confirmed
    # and maybe check if we already sent a notification (though that's complex without a field)
    # A simple way is to check if it's confirmed.
    if instance.status == 'confirmed':
        message = f"Sale Completed: Order SO-{instance.id} for {instance.customer.name} has been confirmed."
        notify_staff(message)

@receiver(post_save, sender=PurchaseOrder)
def purchase_received_alert(sender, instance, created, **kwargs):
    if instance.status == 'received':
        message = f"Stock Added: Purchase PO-{instance.id} from {instance.supplier.name} has been received."
        notify_staff(message)
