# Generated by Django 5.2.1 on 2025-05-16 01:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incident',
            name='incident_type',
            field=models.CharField(choices=[('Doente Não Urgente', 'Doente Não Urgente'), ('Doente Pouco Urgente', 'Doente Pouco Urgente'), ('Doente Urgente', 'Doente Urgente'), ('Doente Muito Urgente', 'Doente Muito Urgente'), ('Doente Emergente', 'Doente Emergente')], max_length=20),
        ),
    ]
