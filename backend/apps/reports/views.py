from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta

from apps.sales.models import SalesOrder, SalesItem, Customer
from apps.purchases.models import PurchaseOrder, PurchaseItem
from apps.inventory.models import Product, Stock, StockMovement
from apps.finance.models import Transaction

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    General KPIs for the dashboard.
    """
    # Totals
    total_sales = Transaction.objects.filter(type='INCOME').aggregate(total=Sum('amount'))['total'] or 0
    total_purchases = Transaction.objects.filter(type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
    profit = float(total_sales) - float(total_purchases)

    # Inventory
    low_stock_threshold = 10
    low_stock_count = Stock.objects.filter(quantity__lt=low_stock_threshold).count()
    
    # Orders
    pending_purchases = PurchaseOrder.objects.filter(status='pending').count()
    recent_sales_count = SalesOrder.objects.filter(date__gte=timezone.now() - timedelta(days=30)).count()

    return Response({
        'total_sales': float(total_sales),
        'total_purchases': float(total_purchases),
        'profit': profit,
        'low_stock_count': low_stock_count,
        'pending_purchases': pending_purchases,
        'recent_sales_30d': recent_sales_count
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_performance(request):
    """
    Sales trends and top products/customers.
    """
    # Sales Trend (Last 30 days)
    last_30_days = timezone.now() - timedelta(days=30)
    sales_trend = (
        SalesOrder.objects.filter(status='confirmed', date__gte=last_30_days)
        .annotate(day=TruncDate('date'))
        .values('day')
        .annotate(total=Sum(F('items__quantity') * F('items__price')))
        .order_by('day')
    )

    # Top Selling Products
    top_products = (
        SalesItem.objects.filter(sales_order__status='confirmed')
        .values('product__name')
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum(F('quantity') * F('price')))
        .order_by('-total_revenue')[:5]
    )

    # Top Customers
    top_customers = (
        SalesOrder.objects.filter(status='confirmed')
        .values('customer__name')
        .annotate(total_spent=Sum(F('items__quantity') * F('items__price')))
        .order_by('-total_spent')[:5]
    )

    return Response({
        'sales_trend': list(sales_trend),
        'top_products': list(top_products),
        'top_customers': list(top_customers)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_reports(request):
    """
    Stock levels and alerts.
    """
    # Current Stock Value
    stock_value = Stock.objects.all().annotate(
        value=F('quantity') * F('product__price') # Note: In real system use purchase price for valuation
    ).aggregate(total=Sum('value'))['total'] or 0

    # Low Stock Items
    low_stock_items = Stock.objects.filter(quantity__lt=10).select_related('product', 'warehouse').values(
        'product__name', 'quantity', 'warehouse__name'
    )

    # Warehouse-wise Distribution
    warehouse_stock = Stock.objects.values('warehouse__name').annotate(
        total_items=Sum('quantity')
    ).order_by('-total_items')

    return Response({
        'total_stock_value': float(stock_value),
        'low_stock_items': list(low_stock_items),
        'warehouse_distribution': list(warehouse_stock)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def finance_analytics(request):
    """
    Deeper financial insights.
    """
    # Monthly Profit Trend (Last 12 months)
    one_year_ago = timezone.now() - timedelta(days=365)
    
    monthly_stats = Transaction.objects.filter(date__gte=one_year_ago).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        income=Sum('amount', filter=Q(type='INCOME')),
        expense=Sum('amount', filter=Q(type='EXPENSE'))
    ).order_by('month')

    formatted_monthly = []
    for entry in monthly_stats:
        income = float(entry['income'] or 0)
        expense = float(entry['expense'] or 0)
        formatted_monthly.append({
            'month': entry['month'].strftime('%b %Y'),
            'income': income,
            'expense': expense,
            'profit': income - expense
        })

    return Response({
        'monthly_analysis': formatted_monthly
    })
