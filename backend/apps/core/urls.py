from django.urls import path
from .views import AuditLogListView, GlobalSearchView

urlpatterns = [
    path('logs/', AuditLogListView.as_view(), name='audit-log-list'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
]
