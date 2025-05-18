from rest_framework import serializers
from .models import Vehicle, MaintenanceRecord, InspectionRecord, Equipment, VehicleEquipment, UniformStock

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'

class InspectionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionRecord
        fields = '__all__'

class VehicleEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleEquipment
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    maintenance_records = MaintenanceRecordSerializer(many=True, read_only=True)
    inspection_records = InspectionRecordSerializer(many=True, read_only=True)
    equipment = VehicleEquipmentSerializer(many=True, read_only=True, source='vehicleequipment_set')

    class Meta:
        model = Vehicle
        fields = ['id', 'type', 'capacity', 'status', 'base', 'maintenance_records', 'inspection_records', 'equipment']

class UniformStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniformStock
        fields = '__all__'
