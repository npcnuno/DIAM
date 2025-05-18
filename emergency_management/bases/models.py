from django.db import models

class BaseAmbulancia(models.Model):
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=255)
    BASE_TYPE_CHOICES = (
        ('INEM', 'INEM'),
        ('Base Operador', 'Base Operador'),
    )
    
    type_of_base =  models.CharField(max_length=20, choices=BASE_TYPE_CHOICES, default='INEM')

    def __str__(self):
        return self.name


