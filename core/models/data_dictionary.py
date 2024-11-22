from django.db import models
from .timestamp import TimeStamp
from django.contrib.postgres.fields import ArrayField
from .data_type import CARE_TYPE_CHOICES
from .fields import ModifiedArrayField

class DataDictionaryModel(TimeStamp):
    cms_term = models.CharField(max_length=255)
    term = models.CharField(max_length=255)
    source_file = models.URLField(blank=True, null=True)
    care_types = ModifiedArrayField(ArrayField(
        models.CharField(max_length=100, choices=CARE_TYPE_CHOICES),
        blank=False
    ))
    definition = models.TextField(blank=True, null=True)
    definition_confidence = models.TextField(blank=True, null=True)
    location_in_website = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.term 