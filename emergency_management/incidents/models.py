from django.db import models
from users.models import User
from vehicles.models import Vehicle

class TransportRequest(models.Model):
    STATUS_CHOICES = (
        ('Pendente', 'Pendente'),
        ('Atribuído', 'Atribuído'),
        ('Em Progresso', 'Em Progresso'),
        ('Concluído', 'Concluído'),
        ('Cancelado', 'Cancelado'),
    )
    STATUS_OF_PATIENT_CHOICES = (
        ('Doente Não Urgente', 'Doente Não Urgente'),
        ('Doente Pouco Urgente', 'Doente Pouco Urgente'),
        ('Doente Urgente', 'Doente Urgente'),
        ('Doente Muito Urgente', 'Doente Muito Urgente'),
        ('Doente Emergente', 'Doente Emergente'),
    )
    request_date = models.DateTimeField(auto_now_add=True)
    destination = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    patient_location = models.CharField(max_length=255, blank=True, null=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    tripulante = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pendente')
    patient_type = models.CharField(max_length=50, choices=STATUS_OF_PATIENT_CHOICES, default='Doente Não Urgente')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transport_requests')

    def __str__(self):
        return f"Pedido de Transporte {self.id} | {self.status} - {self.patient_type}"
