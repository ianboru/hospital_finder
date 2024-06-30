from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp

class CAPHSMetrics(TimeStamp):
    caphs_metric_json = models.JSONField(default=dict)
    hash_value = models.CharField(max_length=64, unique=True)

    