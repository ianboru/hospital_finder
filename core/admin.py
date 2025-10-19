from core import models
# from core.models.favorite import Favorite
from core.models.facility import Facility, Address
from core.models.facility_data import CAPHSMetrics, HAIMetrics
from core.models.data_dictionary import DataDictionaryModel
from django.contrib import admin
from django.utils.html import format_html
import json
import math

class CAPHSMetricsAdmin(admin.ModelAdmin):
    list_display = [
        "facility",
        "get_facility_name",
        "has_valid_json"
    ]
    search_fields = ['facility__facility_id', 'facility__facility_name']
    raw_id_fields = ['facility']
    list_filter = ['facility__care_types']

    def get_facility_name(self, obj):
        return obj.facility.facility_name if obj.facility else "N/A"
    get_facility_name.short_description = "Facility Name"

    def has_valid_json(self, obj):
        try:
            if obj.caphs_metric_json:
                if type(obj.caphs_metric_json) == list:
                    json.loads(obj.caphs_metric_json[0])
                else:
                    json.loads(obj.caphs_metric_json)
                return True
        except:
            return False
        return False
    has_valid_json.boolean = True
    has_valid_json.short_description = "Valid JSON"

admin.site.register(CAPHSMetrics, CAPHSMetricsAdmin)

class HAIMetricsAdmin(admin.ModelAdmin):
    list_display = [
        "facility",
        "get_facility_name",
        "get_infection_rating"
    ]
    search_fields = ['facility__facility_id', 'facility__facility_name']
    raw_id_fields = ['facility']
    list_filter = ['facility__care_types']

    def get_facility_name(self, obj):
        return obj.facility.facility_name if obj.facility else "N/A"
    get_facility_name.short_description = "Facility Name"

    def get_infection_rating(self, obj):
        if obj.hai_metric_json and "Infection Rating" in obj.hai_metric_json:
            return obj.hai_metric_json["Infection Rating"]
        return "N/A"
    get_infection_rating.short_description = "Infection Rating"

admin.site.register(HAIMetrics, HAIMetricsAdmin)


# class FavoriteAdmin(admin.ModelAdmin):
#     list_display = [
#         "user",
#         "hospital",
#     ]

# admin.site.register(Favorite, FavoriteAdmin)

class FacilityAdmin(admin.ModelAdmin):


    list_display = [
        "facility_id",
        "facility_name",
        "care_types",
        "get_city",
        "has_caphs_metrics",
        "has_hai_metrics",
        "caphs_parse_status"
    ]
    list_filter = [
        "care_types",
        "address__city"
    ]
    search_fields = [
        "facility_id",
        "facility_name",
        "care_types",
        "address__city",
        "address__street",
        "address__zip"
    ]
    raw_id_fields = ['address']

    def has_caphs_metrics(self, obj):
        """Check if facility has CAPHS metrics"""
        count = CAPHSMetrics.objects.filter(facility=obj.id).count()
        return count > 0
    has_caphs_metrics.boolean = True
    has_caphs_metrics.short_description = "Has CAPHS"

    def has_hai_metrics(self, obj):
        """Check if facility has HAI metrics"""
        count = HAIMetrics.objects.filter(facility_id=obj.id).count()
        return count > 0
    has_hai_metrics.boolean = True
    has_hai_metrics.short_description = "Has HAI"

    def caphs_parse_status(self, obj):
        """Show if CAPHS metrics can be parsed successfully"""
        caphs_metrics = CAPHSMetrics.objects.filter(facility=obj.id)
        if not caphs_metrics.exists():
            return format_html('<span style="color: gray;">No data</span>')

        try:
            caphs_metric = caphs_metrics[0]
            if caphs_metric.caphs_metric_json:
                if type(caphs_metric.caphs_metric_json) == list:
                    json.loads(caphs_metric.caphs_metric_json[0])
                else:
                    json.loads(caphs_metric.caphs_metric_json)
                return format_html('<span style="color: green;">✓ Valid</span>')
            else:
                return format_html('<span style="color: orange;">Empty</span>')
        except Exception as e:
            return format_html('<span style="color: red;">✗ Parse Error</span>')
    caphs_parse_status.short_description = "CAPHS Status"

    def get_aggregated_data(self, obj):
        """Get aggregated data as it would appear on the front end"""
        from core.views import add_metrics_to_providers

        provider_json = {
            "name": obj.facility_name,
            "caretype": ', '.join(obj.care_types) if obj.care_types else "",
            "id": obj.id,
            "phone_number": obj.phone_number
        }

        if obj.address:
            provider_json["location"] = {
                "latitude": obj.address.latitude,
                "longitude": obj.address.longitude
            }
            provider_json["address"] = f"{obj.address.street}, {obj.address.city}, {obj.address.zip}"

        # Use the same function as the view
        try:
            result = add_metrics_to_providers([provider_json])
            return result[0] if result else provider_json
        except Exception as e:
            return {"error": str(e), "original": provider_json}

    readonly_fields = ['get_aggregated_preview']

    def get_aggregated_preview(self, obj):
        """Show aggregated data preview in detail view"""
        data = self.get_aggregated_data(obj)
        formatted_json = json.dumps(data, indent=2, default=str)
        return format_html('<pre>{}</pre>', formatted_json)
    get_aggregated_preview.short_description = "Aggregated Data Preview (as sent to frontend)"

    fieldsets = (
        ('Basic Information', {
            'fields': ('facility_id', 'facility_name', 'care_types', 'phone_number', 'address')
        }),
        ('Data Preview', {
            'fields': ('get_aggregated_preview',),
            'classes': ('collapse',)
        }),
    )

admin.site.register(Facility, FacilityAdmin)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "street",
        "city",
        "zip",
    ]
    search_fields = [
        "street",
        "city",
        "zip",
    ]

admin.site.register(Address, AddressAdmin)
class DataDictionaryModelAdmin(admin.ModelAdmin):
    list_display = [
        "cms_term",
        "term",
        "care_types",
        "source_file",
        "definition",
        "definition_confidence",
        "location_in_website",
    ]
    search_fields = [
        "cms_term",
        "term",
        "care_types",
        "source_file",
        "definition",
        "definition_confidence",
        "location_in_website",
    ]
    
admin.site.register(DataDictionaryModel, DataDictionaryModelAdmin)
