from rest_framework import viewsets, generics, permissions
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, TrainingRecord, BaseAmbulancia
from .serializers import UserSerializer, TrainingRecordSerializer, OperatorSerializer, PersonnelSerializer, LoginSerializer, BaseAmbulanciaSerializer
from emergency_management.permissions import IsAdminOperator, IsAdminBase, TrainingRecordPermission
from vehicles.models import Vehicle

class BaseAmbulanciaViewSet(viewsets.ModelViewSet):
    queryset = BaseAmbulancia.objects.all()
    serializer_class = BaseAmbulanciaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BaseAmbulanceOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bases = BaseAmbulancia.objects.all()
        data = []
        for base in bases:
            ambulances = Vehicle.objects.filter(
                base=base, type__in=['Carrinha Ambulancia', 'Carro Ambulancia']
            )
            data.append({
                'id': base.id,
                'name': base.name,
                'ambulances': [{'id': amb.id, 'name': amb.type} for amb in ambulances]
            })
        return Response(data)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'base': BaseAmbulanciaSerializer(user.base).data if user.base else None
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'base': BaseAmbulanciaSerializer(user.base).data if user.base else None
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser | IsAdminBase | IsAdminOperator]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return User.objects.all()
        elif (user.role == 'AdminBase' or user.role =='AdminOperator'):
            return User.objects.filter(base=user.base)
        return User.objects.filter(id=user.id)

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='Operador')
    serializer_class = OperatorSerializer
    permission_classes = [IsAdminOperator]

class PersonnelViewSet(viewsets.ModelViewSet):
    serializer_class = PersonnelSerializer
    permission_classes = [IsAdminBase]

    def get_queryset(self):
        return User.objects.filter(role='Pessoal', base=self.request.user.base)

class TrainingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingRecordSerializer
    permission_classes = [TrainingRecordPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return TrainingRecord.objects.all()
        elif (user.role == 'AdminBase' or user.role == 'IsAdminOperator'):
            return TrainingRecord.objects.filter(user__base=user.base, user__role='Pessoal')
        elif user.role == 'Pessoal':
            return TrainingRecord.objects.filter(user=user)
        else:
            return TrainingRecord.objects.none()
