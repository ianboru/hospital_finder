# Generated by Django 4.0.4 on 2025-01-11 20:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_datadictionarymodel'),
    ]

    operations = [
        migrations.AddField(
            model_name='datadictionarymodel',
            name='unit',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='datadictionarymodel',
            name='unit_features',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
