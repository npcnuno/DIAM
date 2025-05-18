from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterView, LoginView, UserViewSet, TrainingRecordViewSet
from incidents.views import TransportRequestViewSet 
from django.views.decorators.csrf import csrf_exempt
from bases.views import BaseAmbulanciaViewSet, BaseAmbulanceOptionsView
from vehicles.views import (
    VehicleViewSet, EquipmentViewSet, VehicleEquipmentViewSet, MaintenanceRecordViewSet,
    InspectionRecordViewSet, UniformStockViewSet, vehicle_usage_stats
)
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'training_records', TrainingRecordViewSet, basename="trainingrecords")
router.register(r'transport_requests', TransportRequestViewSet, basename='transportrequest')
router.register(r'vehicles', VehicleViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'vehicle_equipment', VehicleEquipmentViewSet, basename="vehicle_equipment")
router.register(r'maintenance_records', MaintenanceRecordViewSet, basename='maintenance_records')
router.register(r'inspection_records', InspectionRecordViewSet, basename='inspection_records')
router.register(r'uniform_stock', UniformStockViewSet, basename='uniform_stock')
router.register(r'bases', BaseAmbulanciaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/base/', BaseAmbulanceOptionsView.as_view(), name='base-options'),
    path('api/register/', csrf_exempt(RegisterView.as_view()), name='register'),
    path('api/login/', csrf_exempt(LoginView.as_view()), name='login'),
    path('api/vehicle_usage_stats/', vehicle_usage_stats, name='vehicle_usage_stats'),
]
