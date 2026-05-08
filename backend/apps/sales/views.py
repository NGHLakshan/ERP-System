from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, SalesOrder, SalesItem
from .serializers import (
    CustomerSerializer,
    SalesOrderSerializer,
    SalesOrderCreateSerializer,
    SalesItemSerializer
)
from apps.users.permissions import IsManager, IsStaff
from apps.inventory.models import Stock


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]

    def get_queryset(self):
        queryset = Customer.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(phone__icontains=search)
        return queryset


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all().order_by('-date')
    permission_classes = [IsStaff]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SalesOrderCreateSerializer
        return SalesOrderSerializer

    def update(self, request, *args, **kwargs):
        """Only allow editing of DRAFT orders."""
        instance = self.get_object()
        if instance.status != 'draft':
            return Response(
                {'detail': f'Cannot edit an order with status: {instance.status}. Only DRAFT orders can be edited.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Only allow partial editing of DRAFT orders."""
        instance = self.get_object()
        if instance.status != 'draft':
            return Response(
                {'detail': f'Cannot edit an order with status: {instance.status}. Only DRAFT orders can be edited.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def confirm(self, request, pk=None):
        """Mark a SalesOrder as confirmed, triggering stock deduction via signal."""
        order = self.get_object()

        if order.status == 'confirmed':
            return Response({'detail': 'Order is already confirmed.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'cancelled':
            return Response({'detail': 'Cannot confirm a cancelled order.'}, status=status.HTTP_400_BAD_REQUEST)
        if not order.items.exists():
            return Response({'detail': 'Cannot confirm an empty order. Add items first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock availability before confirming
        for item in order.items.all():
            stock = Stock.objects.filter(product=item.product).first()
            available_qty = stock.quantity if stock else 0
            if available_qty < item.quantity:
                return Response(
                    {'detail': f'Insufficient stock for "{item.product.name}". Available: {available_qty}, Required: {item.quantity}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        order.status = 'confirmed'
        order.save()
        return Response({'detail': 'Order confirmed. Stock has been deducted.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsManager])
    def cancel(self, request, pk=None):
        """Cancel a SalesOrder, triggering stock reversion via signal if it was confirmed."""
        order = self.get_object()

        if order.status == 'cancelled':
            return Response({'detail': 'Order is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        was_confirmed = order.status == 'confirmed'

        order.status = 'cancelled'
        order._was_confirmed_before_cancel = was_confirmed
        order.save()

        msg = 'Order cancelled.'
        if was_confirmed:
            msg += ' Stock has been reverted.'

        return Response({'detail': msg}, status=status.HTTP_200_OK)


class SalesItemViewSet(viewsets.ModelViewSet):
    queryset = SalesItem.objects.all()
    serializer_class = SalesItemSerializer
