from core import models
from core.models.favorite import Favorite
from core.models.facility import Facility, Address
from django.contrib import admin

class FavoriteAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "hospital",
    ]

admin.site.register(Favorite, FavoriteAdmin)

class FacilityAdmin(admin.ModelAdmin):
    list_display = [
        "facility_name",
        "care_type",
        "address"
    ]

admin.site.register(Facility, FacilityAdmin)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "zip",
        "street",
        "city"
    ]

admin.site.register(Address, AddressAdmin)