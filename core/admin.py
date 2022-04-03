from django.contrib import admin
from core.models import Favorite

class FavoriteAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "hospital",
    ]

admin.site.register(Favorite, FavoriteAdmin)