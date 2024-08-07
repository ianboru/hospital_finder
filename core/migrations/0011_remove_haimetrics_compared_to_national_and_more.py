# Generated by Django 5.0.6 on 2024-07-12 22:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_alter_haimetrics_score'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='haimetrics',
            name='compared_to_national',
        ),
        migrations.RemoveField(
            model_name='haimetrics',
            name='measure_id',
        ),
        migrations.RemoveField(
            model_name='haimetrics',
            name='measure_name',
        ),
        migrations.RemoveField(
            model_name='haimetrics',
            name='score',
        ),
        migrations.AlterField(
            model_name='haimetrics',
            name='hai_metric_json',
            field=models.JSONField(default=list),
        ),
    ]
