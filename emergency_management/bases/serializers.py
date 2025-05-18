from rest_framework import serializers
from .models import BaseAmbulancia
from vehicles.serializers import VehicleSerializer 
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']


class BaseAmbulanciaSerializer(serializers.ModelSerializer):
    vehicles = VehicleSerializer(many=True, read_only=True)

    class Meta:
        model = BaseAmbulancia
        fields = ['id', 'name', 'location', 'vehicles']
