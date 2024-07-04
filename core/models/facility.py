from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp
from .facility_data import HAIMetrics, CAPHSMetrics

class Facility(TimeStamp):
    facility_name = models.CharField(max_length=100, blank=False) 
    facility_id = models.CharField(max_length=20, blank=False, unique=True) 
    care_type = models.CharField(max_length=100, blank=False) 
    address = models.ForeignKey(
        'Address',
        on_delete=models.CASCADE,
        related_name='facility',
        null=True,
        blank=True,
    )
    hai_metric = models.ForeignKey(
        HAIMetrics,
        on_delete=models.CASCADE,
        related_name='HAIMetric',
        null=True,
        blank=True,
    )
    caphs_metric = models.ForeignKey(
        CAPHSMetrics,
        on_delete=models.CASCADE,
        related_name='CAPHSMetric',
        null=True,
        blank=True,
    )
    
class Address(TimeStamp):
    zip = models.IntegerField()
    street = models.CharField(max_length=100, blank=True) 
    city = models.CharField(max_length=100, blank=True) 
    
    def __str__(self):
        return f"{self.street} {self.city} {self.zip}"
    
# still need to add Hai Metric and CAPHS
