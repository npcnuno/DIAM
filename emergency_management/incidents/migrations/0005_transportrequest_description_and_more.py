# Generated by Django 5.2.1 on 2025-05-17 16:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0004_transportrequest_delete_incident'),
    ]

    operations = [
        migrations.AddField(
            model_name='transportrequest',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transportrequest',
            name='patient_location',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
