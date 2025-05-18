from django.db import models
from users.models import User
from bases.models import BaseAmbulancia

class Vehicle(models.Model):
    TIPO_CHOICES = (
        ('Carrinha Ambulância', 'Carrinha Ambulância'),
        ('Carro Ambulância', 'Carro Ambulância'),
        ('Helicóptero', 'Helicóptero'),
    )
    STATUS_CHOICES = (
        ('Disponível', 'Disponível'),
        ('Em Uso', 'Em Uso'),
        ('Manutenção', 'Manutenção'),
    )
    type = models.CharField(max_length=100, choices=TIPO_CHOICES)
    capacity = models.IntegerField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Disponível')
    base = models.ForeignKey(BaseAmbulancia, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        # Save the vehicle first to ensure it has an ID and base is set
        super().save(*args, **kwargs)
        
        # Count personnel at the base (assuming 'Pessoal' is the role for personnel)
        personnel_count = User.objects.filter(base=self.base, role='Pessoal').count()
        
        # Update status based on personnel count vs. capacity
        if personnel_count < self.capacity:
            self.status = 'Manutenção'  # Vehicle disabled due to insufficient personnel
        else:
            self.status = 'Disponível'  # Vehicle available if personnel meets capacity
        
        # Save again with the updated status
        super().save(update_fields=['status'])

    def __str__(self):
        return f"{self.type} - {self.base.name}"

class MaintenanceRecord(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_records')
    date = models.DateField()
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Manutenção {self.vehicle} - {self.date}"

class InspectionRecord(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='inspection_records')
    date = models.DateField()
    result = models.CharField(max_length=50, choices=(('Aprovado', 'Aprovado'), ('Reprovado', 'Reprovado')))
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Inspeção {self.vehicle} - {self.date}"

class Equipment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class VehicleEquipment(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    class Meta:
        unique_together = ('vehicle', 'equipment')

    def __str__(self):
        return f"{self.vehicle} - {self.equipment}: {self.quantity}"

class UniformStock(models.Model):
    TYPE_CHOICES = (
        ('Farda Completa', 'Farda Completa'),
        ('Calças', 'Calças'),
        ('Camisola', 'Camisola'),
    )
    type = models.CharField(max_length=100, choices=TYPE_CHOICES)
    quantity_received = models.IntegerField(default=0)
    quantity_delivered = models.IntegerField(default=0)
    date_received = models.DateField()
    base = models.ForeignKey(BaseAmbulancia, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.type} - {self.base.name}"
