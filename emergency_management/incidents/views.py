from rest_framework import viewsets
from .models import TransportRequest
from .serializers import TransportRequestSerializer
from emergency_management.permissions import TransportRequestPermission

class TransportRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TransportRequestSerializer
    permission_classes = [TransportRequestPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Administrator':
            return TransportRequest.objects.all()
        elif user.role == 'AdminBase':
            return TransportRequest.objects.filter(vehicle__base=user.base)
        elif user.role in ['Operador', 'AdminOperator']:
            return TransportRequest.objects.filter(requester=user)
        elif user.role == 'Pessoal':
            return TransportRequest.objects.filter(tripulante=user)
        else:
            return TransportRequest.objects.none()

    def perform_create(self, serializer):
        if (self.request.user.role == 'Operador' or self.request.user.role == 'AdminOperator'):
            serializer.save(requester=self.request.user)
        else:
            serializer.save()
