from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, finance_summary, daily_report, monthly_report

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', finance_summary, name='finance-summary'),
    path('reports/daily/', daily_report, name='finance-daily-report'),
    path('reports/monthly/', monthly_report, name='finance-monthly-report'),
]
