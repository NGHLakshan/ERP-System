from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/purchases/', include('apps.purchases.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
