from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp
from ..models.facility import Facility

class CAPHSMetrics(TimeStamp):
    caphs_metric_json = models.JSONField(default=dict)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='caphs_metrics', blank=False)

class HAIMetrics(TimeStamp):
    hai_metric_json = models.JSONField(default=dict)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='hai_metrics', blank=False)
    measure_id = models.CharField(max_length=100, default = 'No Data')
    measure_name = models.CharField(max_length=255, default = 'No Data')
    compared_to_national = models.CharField(max_length=255, default = 'No Data')
    score = models.CharField(max_length=255, default = 'Not Available')
