from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp

class Facility(TimeStamp):
    facility_name = models.CharField(max_length=100, blank=False) 
    care_type = models.CharField(max_length=100, blank=True) 
    address = models.ForeignKey(
        'Address',
        on_delete=models.CASCADE,
        related_name='facility',
        null=True,
        blank=True,
    )
    
class Address(TimeStamp):
    zip = models.IntegerField()
    street = models.CharField(max_length=100, blank=True) 
    city = models.CharField(max_length=100, blank=True) 
    
# still need to add Hai Metric and CAPHS