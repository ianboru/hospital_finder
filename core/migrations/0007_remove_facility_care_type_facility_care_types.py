# Generated by Django 5.0.1 on 2024-07-07 20:12

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_remove_facility_caphs_metric_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='facility',
            name='care_type',
        ),
        migrations.AddField(
            model_name='facility',
            name='care_types',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=["ED"], size=None),
            preserve_default=False,
        ),
    ]