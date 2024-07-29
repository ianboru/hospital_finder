from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp
from .facility import Facility

class CAPHSMetrics(TimeStamp):
    caphs_metric_json = models.JSONField(default=dict)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='caphs_metrics', blank=False)

class HAIMetrics(TimeStamp):
    hai_metric_json = models.JSONField(default=list)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='hai_metrics', blank=False)