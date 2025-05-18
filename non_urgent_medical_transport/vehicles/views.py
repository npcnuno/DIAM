from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from .models import Vehicle, Equipment, VehicleEquipment, MaintenanceRecord, InspectionRecord, UniformStock
from .serializers import (
    VehicleSerializer, EquipmentSerializer, VehicleEquipmentSerializer,
    MaintenanceRecordSerializer, InspectionRecordSerializer, UniformStockSerializer
)
from emergency_management.permissions import VehiclePermission, IsAdminBase

from rest_framework.permissions import IsAuthenticated


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAdminBase]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return MaintenanceRecord.objects.all()
        elif user.role == 'AdminBase':
            return MaintenanceRecord.objects.filter(vehicle__base=user.base)
        return MaintenanceRecord.objects.none()

class InspectionRecordViewSet(viewsets.ModelViewSet):
    serializer_class = InspectionRecordSerializer
    permission_classes = [IsAdminBase]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return InspectionRecord.objects.all()
        elif user.role == 'AdminBase':
            return InspectionRecord.objects.filter(vehicle__base=user.base)
        return InspectionRecord.objects.none()

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAdminBase]

class VehicleEquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleEquipmentSerializer
    permission_classes = [IsAdminBase]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return VehicleEquipment.objects.all()
        elif user.role == 'AdminBase':
            return VehicleEquipment.objects.filter(vehicle__base=user.base)
        return VehicleEquipment.objects.none()

class UniformStockViewSet(viewsets.ModelViewSet):
    serializer_class = UniformStockSerializer
    permission_classes = [IsAdminBase]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return UniformStock.objects.all()
        elif user.role == 'AdminBase':
            return UniformStock.objects.filter(base=user.base)
        return UniformStock.objects.none()

@api_view(['GET'])
def vehicle_usage_stats(request):
    if not request.user.is_authenticated or request.user.role != 'Administrator':
        return Response({'error': 'Permissão negada'}, status=403)
    vehicles = Vehicle.objects.annotate(num_requests=Count('transportrequest')).values('id', 'type', 'num_requests')
    return Response(vehicles)
