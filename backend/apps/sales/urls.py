from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SalesOrderViewSet, SalesItemViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'orders', SalesOrderViewSet)
router.register(r'items', SalesItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
