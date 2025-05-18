from rest_framework import serializers
from .models import TransportRequest

class TransportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportRequest
        fields = '__all__'
        read_only_fields = ['requester']

    def validate_vehicle(self, value):
        user = self.context['request'].user
        if (user.role == 'Operador' or  user.role == 'AdminOperator' or user.role == 'Pessoal') and value.base != user.base:
            raise serializers.ValidationError("You can only select vehicles from your base.")
        return value
