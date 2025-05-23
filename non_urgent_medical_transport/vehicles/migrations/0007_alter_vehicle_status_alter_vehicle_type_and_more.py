# Generated by Django 5.2.1 on 2025-05-18 05:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bases', '0002_alter_baseambulancia_name'),
        ('vehicles', '0006_remove_vehicle_last_maintenance_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vehicle',
            name='status',
            field=models.CharField(choices=[('Disponível', 'Disponível'), ('Em Uso', 'Em Uso'), ('Manutenção', 'Manutenção')], default='Disponível', max_length=50),
        ),
        migrations.AlterField(
            model_name='vehicle',
            name='type',
            field=models.CharField(choices=[('Carrinha Ambulância', 'Carrinha Ambulância'), ('Carro Ambulância', 'Carro Ambulância'), ('Helicóptero', 'Helicóptero')], max_length=100),
        ),
        migrations.CreateModel(
            name='InspectionRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('result', models.CharField(choices=[('Aprovado', 'Aprovado'), ('Reprovado', 'Reprovado')], max_length=50)),
                ('notes', models.TextField(blank=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inspection_records', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='MaintenanceRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('cost', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_records', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='UniformStock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('Farda Completa', 'Farda Completa'), ('Calças', 'Calças'), ('Camisola', 'Camisola')], max_length=100)),
                ('quantity_received', models.IntegerField(default=0)),
                ('quantity_delivered', models.IntegerField(default=0)),
                ('date_received', models.DateField()),
                ('base', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bases.baseambulancia')),
            ],
        ),
    ]
