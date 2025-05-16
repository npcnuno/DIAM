from django.db import models
from users.models import User
from vehicles.models import Vehicle

class Incident(models.Model):
    TYPE_CHOICES = (
        ('Doente Não Urgente', 'Doente Não Urgente'),
        ('Doente Pouco Urgente', 'Doente Pouco Urgente'),
        ('Doente Urgente', 'Doente Urgente'),
        ('Doente Muito Urgente', 'Doente Muito Urgente'),
        ('Doente Emergente', 'Doente Emergente')
    )
    date = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=200)
    description = models.TextField()
    incident_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, default='Open')
    assigned_personnel = models.ManyToManyField(User, limit_choices_to={'role': 'Personnel'})
    assigned_vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.incident_type} at {self.location}"