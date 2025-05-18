from rest_framework import serializers
from .models import User, TrainingRecord 
from bases.models import  BaseAmbulancia 
from vehicles.models import Vehicle
from .models import  BaseAmbulancia

class UserSerializer(serializers.ModelSerializer):
    base_name = serializers.CharField(write_only=True, required=False)
    base_location = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'base', 'base_name', 'base_location']
        extra_kwargs = {'password': {'write_only': True}, 'base': {'required': False}}

    def validate(self, data):
        role = data.get('role')
        base_name = data.get('base_name')
        base_location = data.get('base_location')
        type_of_base = data.get('type_of_base')

        # Validation for AdminBase and AdminOperator
        if role in ('AdminBase', 'AdminOperator'):
            if not base_name or not base_location:
                raise serializers.ValidationError(
                    f"Para {role}, base_name e base_location são obrigatórios."
                )
            # Ensure type_of_base is provided or set default
            if not type_of_base:
                data['type_of_base'] = 'INEM' if role == 'AdminBase' else 'Base Operador'
            elif type_of_base not in [choice[0] for choice in BaseAmbulancia.BASE_TYPE_CHOICES]:
                raise serializers.ValidationError(
                    f"Tipo de base inválido. Escolha entre: {', '.join([c[0] for c in BaseAmbulancia.BASE_TYPE_CHOICES])}."
                )
            # Prevent manual base assignment
            if 'base' in data:
                raise serializers.ValidationError(
                    f"Para {role}, não forneça base, pois será criado automaticamente."
                )

        # Validate password
        if 'password' not in data or not data['password']:
            raise serializers.ValidationError("A senha é obrigatória.")

        # Check for duplicate base name
        if base_name and BaseAmbulancia.objects.filter(name=base_name).exists():
            raise serializers.ValidationError(f"Uma base com o nome '{base_name}' já existe.")

        return data

    def create(self, validated_data):
        role = validated_data.get('role')
        if role == 'AdminBase':
            base_name = validated_data.pop('base_name')
            base_location = validated_data.pop('base_location')
            base = BaseAmbulancia.objects.create(name=base_name, location=base_location, type_of_base="INEM")

            validated_data['base'] = base
        if role == "AdminOperator":
            base_name = validated_data.pop('base_name')
            base_location = validated_data.pop('base_location')
            base = BaseAmbulancia.objects.create(name=base_name, location=base_location, type_of_base="Base Operador")
            validated_data['base'] = base

        user = User(
            username=validated_data['username'],
            role=role,
            base=validated_data.get('base', None)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class VehicleSerializer(serializers.ModelSerializer):
    personnel = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'type', 'status', 'last_maintenance_date', 'next_inspection_date', 'personnel']

class BaseAmbulanciaSerializer(serializers.ModelSerializer):
    vehicles = VehicleSerializer(many=True, read_only=True)

    class Meta:
        model = BaseAmbulancia
        fields = ['id', 'name', 'location', 'vehicles']



class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def validate_role(self, value):
        if value != 'Operador':
            raise serializers.ValidationError("Can only create users with role 'Operador'.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class PersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'role']
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ['base']

    def create(self, validated_data):
        validated_data['base'] = self.context['request'].user.base
        validated_data['role'] = 'Pessoal'
        user = User.objects.create_user(**validated_data)
        return user

class TrainingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRecord
        fields = '__all__'

    def validate_user(self, value):
        request = self.context['request']
        if request.user.role == 'AdminBase':
            if value.base != request.user.base or value.role != 'Pessoal':
                raise serializers.ValidationError("You can only create training records for personnel in your base.")
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
