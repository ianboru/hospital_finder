from django.db import models
from django.contrib.auth.models import User
from .timestamp import TimeStamp
from django.contrib.postgres.fields import ArrayField
from django import forms

CARE_TYPE_CHOICES = [
    ('ED', 'ED'),
    ('Hospital', 'Hospital'),
    ('Home Health', 'Home Health'),
    ('Hospice', 'Hospice'),
    ('Outpatient', 'Outpatient'),
]
class ModifiedArrayField(ArrayField):
    def formfield(self, **kwargs):
        defaults = {
            "form_class": forms.MultipleChoiceField,
            "choices": self.base_field.choices if self.base_field.choices else CARE_TYPE_CHOICES,
            "widget": forms.CheckboxSelectMultiple,
            **kwargs
        }
        return super(ArrayField, self).formfield(**defaults)
class Facility(TimeStamp):
    facility_name = models.CharField(max_length=100, blank=False) 
    facility_id = models.CharField(max_length=20, blank=False, unique=True) 
    care_types = ModifiedArrayField(ArrayField(
        models.CharField(max_length=100, choices=CARE_TYPE_CHOICES),
        blank=False
    ))
    address = models.ForeignKey(
        'Address',
        on_delete=models.CASCADE,
        related_name='facility',
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.facility_name}"
    
class Address(TimeStamp):
    zip = models.IntegerField()
    street = models.CharField(max_length=100, blank=True) 
    city = models.CharField(max_length=100, blank=True) 
    
    def __str__(self):
        return f"{self.street} {self.city} {self.zip}"
    


    
    
# still need to add Hai Metric and CAPHS
