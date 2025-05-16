from django.db import models

class Vehicle(models.Model):
    TYPE_CHOICES = (
        ('Carrinha Ambulancia', 'Carrinha Ambulance'),
        ('Carro Ambulancia', 'Carro Ambulancia'),
        ('Helicóptero', 'Helicóptero')
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    capacity = models.IntegerField()
    status = models.CharField(max_length=20, default='Available')

    def __str__(self):
        return f"{self.type} - {self.status}"
