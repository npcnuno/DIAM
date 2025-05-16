from rest_framework import serializers
from .models import Incident
from vehicles.models import Vehicle  # Add this line
from users.serializers import UserSerializer
from users.models import User
from vehicles.serializers import VehicleSerializer

class IncidentSerializer(serializers.ModelSerializer):
    assigned_personnel = UserSerializer(many=True, read_only=True)
    assigned_vehicle = VehicleSerializer(read_only=True)
    assigned_vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), source='assigned_vehicle', write_only=True
    )
    assigned_personnel_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='Personnel'), many=True, write_only=True, source='assigned_personnel'
    )

    class Meta:
        model = Incident
        fields = '__all__'