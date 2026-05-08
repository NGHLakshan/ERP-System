from rest_framework import generics, filters, views, response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.inventory.models import Product
from apps.sales.models import Customer, SalesOrder
from apps.users.permissions import IsAdmin

class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'model_name', 'user']
    search_fields = ['model_name', 'object_id', 'user__username']
    ordering_fields = ['timestamp']

class GlobalSearchView(views.APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return response.Response({'results': []})

        results = []

        # Search Products
        products = Product.objects.filter(name__icontains=query)[:5]
        for p in products:
            results.append({
                'id': p.id,
                'name': p.name,
                'type': 'Product',
                'url': f'/products' # Navigate to product list or details
            })

        # Search Customers
        customers = Customer.objects.filter(name__icontains=query)[:5]
        for c in customers:
            results.append({
                'id': c.id,
                'name': c.name,
                'type': 'Customer',
                'url': '/customers'
            })

        # Search Sales Orders
        if query.startswith('SO-'):
            so_id = query.replace('SO-', '')
            orders = SalesOrder.objects.filter(id__icontains=so_id)[:5]
        else:
            orders = SalesOrder.objects.filter(customer__name__icontains=query)[:5]
            
        for o in orders:
            results.append({
                'id': o.id,
                'name': f"SO-{o.id} - {o.customer.name if o.customer else 'No Customer'}",
                'type': 'Sales Order',
                'url': f'/sales/orders/{o.id}'
            })

        return response.Response({'results': results})
