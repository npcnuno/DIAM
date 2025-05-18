from django.db import models
from django.contrib.auth.models import AbstractUser
from bases.models import BaseAmbulancia

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Administrator', 'Administrator'),
        ('AdminOperator', 'Operator Administrator'),
        ('AdminBase', 'AdminBase'),
        ('Operador', 'Operator'),
        ('Pessoal', 'Personnel'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Pessoal')
    base = models.ForeignKey(BaseAmbulancia, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.username

class TrainingRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=100)
    course_date = models.DateField()
    certification = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.course_name}"
