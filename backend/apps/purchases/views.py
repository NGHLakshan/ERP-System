from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PurchaseOrder, PurchaseItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderCreateSerializer, PurchaseItemSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Mark a PurchaseOrder as received, triggering stock update via signal."""
        order = self.get_object()
        if order.status == 'received':
            return Response({'detail': 'Order already received.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'cancelled':
            return Response({'detail': 'Cannot receive a cancelled order.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'received'
        order.save()
        return Response({'detail': 'Order marked as received. Stock updated.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a PurchaseOrder."""
        order = self.get_object()
        if order.status == 'received':
            return Response({'detail': 'Cannot cancel a received order.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'cancelled'
        order.save()
        return Response({'detail': 'Order cancelled.'}, status=status.HTTP_200_OK)


class PurchaseItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer
