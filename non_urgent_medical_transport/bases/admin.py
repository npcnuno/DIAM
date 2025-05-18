from django.contrib import admin
from .models import BaseAmbulancia
from vehicles.models import Vehicle

class VehicleInline(admin.TabularInline):
    model = Vehicle
    extra = 1

@admin.register(BaseAmbulancia)
class BaseAmbulanciaAdmin(admin.ModelAdmin):
    inlines = [VehicleInline]
    list_display = ['name', 'location']
