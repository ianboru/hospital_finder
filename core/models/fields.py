from django import forms
from django.contrib.postgres.fields import ArrayField
from .data_type import CARE_TYPE_CHOICES  # Import the choices

class ModifiedArrayField(ArrayField):
    def formfield(self, **kwargs):
        defaults = {
            "form_class": forms.MultipleChoiceField,
            "choices": self.base_field.choices if self.base_field.choices else CARE_TYPE_CHOICES,
            "widget": forms.CheckboxSelectMultiple,
            **kwargs
        }
        return super(ArrayField, self).formfield(**defaults)