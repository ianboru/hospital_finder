from core import models
from core.models.favorite import Favorite
from core.models.facility import Facility, Address
from core.models.facility_data import CAPHSMetrics, HAIMetrics
from django.contrib import admin

class CAPHSMetricsAdmin(admin.ModelAdmin):
    list_display = [
        "caphs_metric_json",
        "id"
    ]

admin.site.register(CAPHSMetrics, CAPHSMetricsAdmin)

class HAIMetricsAdmin(admin.ModelAdmin):
    list_display = [
        "hai_metric_json",
        "id"
    ]

admin.site.register(HAIMetrics, HAIMetricsAdmin)


class FavoriteAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "hospital",
    ]

admin.site.register(Favorite, FavoriteAdmin)

class FacilityAdmin(admin.ModelAdmin):
    list_display = [
        "facility_id",
        "facility_name",
        "care_type",
        "address"
    ]
    search_fields = [
        "facility_id",
        "facility_name",
        "care_type",
        "address__city",
        "address__street",
        "address__zip"
    ]
    raw_id_fields = ['address']

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