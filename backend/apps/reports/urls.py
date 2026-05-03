from django.urls import path
from .views import dashboard_stats, sales_performance, inventory_reports, finance_analytics

urlpatterns = [
    path('dashboard/', dashboard_stats, name='report-dashboard'),
    path('sales/', sales_performance, name='report-sales'),
    path('inventory/', inventory_reports, name='report-inventory'),
    path('finance/', finance_analytics, name='report-finance'),
]
