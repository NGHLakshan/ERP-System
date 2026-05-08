from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.permissions import IsManager
from django.db.models import Sum, Q
from django.db.models.functions import TruncDate, TruncMonth
import datetime

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve transactions.
    Supports filtering by: type, date_from, date_to
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        queryset = Transaction.objects.all()

        # Filter by type (INCOME / EXPENSE)
        t_type = self.request.query_params.get('type', None)
        if t_type:
            queryset = queryset.filter(type=t_type.upper())

        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset.order_by('-created_at')


@api_view(['GET'])
@permission_classes([IsManager])
def finance_summary(request):
    """
    Returns total income, total expense, and net profit.
    Supports optional date range filters: date_from, date_to
    """
    queryset = Transaction.objects.all()

    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    if date_from:
        queryset = queryset.filter(date__gte=date_from)
    if date_to:
        queryset = queryset.filter(date__lte=date_to)

    total_income = queryset.filter(type='INCOME').aggregate(total=Sum('amount'))['total'] or 0
    total_expense = queryset.filter(type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
    net_profit = total_income - total_expense

    return Response({
        'total_income': float(total_income),
        'total_expense': float(total_expense),
        'net_profit': float(net_profit),
    })


@api_view(['GET'])
@permission_classes([IsManager])
def daily_report(request):
    """
    Returns daily income/expense breakdown.
    Optional: date_from, date_to
    """
    queryset = Transaction.objects.all()

    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    if date_from:
        queryset = queryset.filter(date__gte=date_from)
    if date_to:
        queryset = queryset.filter(date__lte=date_to)

    income_by_day = (
        queryset.filter(type='INCOME')
        .annotate(day=TruncDate('date'))
        .values('day')
        .annotate(total=Sum('amount'))
        .order_by('day')
    )

    expense_by_day = (
        queryset.filter(type='EXPENSE')
        .annotate(day=TruncDate('date'))
        .values('day')
        .annotate(total=Sum('amount'))
        .order_by('day')
    )

    # Merge into a single structure keyed by date
    report = {}
    for row in income_by_day:
        day_str = str(row['day'])
        report.setdefault(day_str, {'date': day_str, 'income': 0, 'expense': 0})
        report[day_str]['income'] = float(row['total'])

    for row in expense_by_day:
        day_str = str(row['day'])
        report.setdefault(day_str, {'date': day_str, 'income': 0, 'expense': 0})
        report[day_str]['expense'] = float(row['total'])

    result = sorted(report.values(), key=lambda x: x['date'])
    for row in result:
        row['profit'] = row['income'] - row['expense']

    return Response(result)


@api_view(['GET'])
@permission_classes([IsManager])
def monthly_report(request):
    """
    Returns monthly income/expense breakdown.
    Optional: year (e.g. 2026)
    """
    queryset = Transaction.objects.all()

    year = request.query_params.get('year', None)
    if year:
        queryset = queryset.filter(date__year=year)

    income_by_month = (
        queryset.filter(type='INCOME')
        .annotate(month=TruncMonth('date'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    expense_by_month = (
        queryset.filter(type='EXPENSE')
        .annotate(month=TruncMonth('date'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    report = {}
    for row in income_by_month:
        month_str = row['month'].strftime('%Y-%m')
        report.setdefault(month_str, {'month': month_str, 'income': 0, 'expense': 0})
        report[month_str]['income'] = float(row['total'])

    for row in expense_by_month:
        month_str = row['month'].strftime('%Y-%m')
        report.setdefault(month_str, {'month': month_str, 'income': 0, 'expense': 0})
        report[month_str]['expense'] = float(row['total'])

    result = sorted(report.values(), key=lambda x: x['month'])
    for row in result:
        row['profit'] = row['income'] - row['expense']

    return Response(result)
