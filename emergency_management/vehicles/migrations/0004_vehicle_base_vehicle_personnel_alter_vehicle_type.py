# Generated by Django 5.2.1 on 2025-05-17 08:14

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bases', '0001_initial'),
        ('vehicles', '0003_equipment_vehicle_last_maintenance_date_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='vehicle',
            name='base',
            field=models.ForeignKey(default=None,null=True, on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to='bases.baseambulancia'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vehicle',
            name='personnel',
            field=models.ManyToManyField(related_name='vehicles', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='vehicle',
            name='type',
            field=models.CharField(choices=[('Carrinha Ambulancia', 'Carrinha Ambulancia'), ('Carro Ambulancia', 'Carro Ambulancia'), ('Helicóptero', 'Helicóptero')], max_length=50),
        ),
    ]
