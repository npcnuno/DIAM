from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import BaseAmbulancia
from .serializers import BaseAmbulanciaSerializer
from vehicles.models import Vehicle

class BaseAmbulanciaViewSet(viewsets.ModelViewSet):
    queryset = BaseAmbulancia.objects.all()
    serializer_class = BaseAmbulanciaSerializer
    permission_classes = [IsAuthenticated]

class BaseAmbulanceOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bases = BaseAmbulancia.objects.all()
        data = []
        for base in bases:
            if base.type_of_base == "INEM":
                ambulances = Vehicle.objects.filter(
                base=base, type__in=['Carrinha Ambulancia', 'Carro Ambulancia']
                )
                data.append({
                'id': base.id,
                'name': base.name,
                'ambulances': [{'id': amb.id, 'name': amb.type} for amb in ambulances]
                })
            else:
                data.append({
                    'id':base.id,
                    'name': base.name,
                    'location': base.location,
                })
        return Response(data)
