from core import models
from core.models.Favorite import Favorite
from django.contrib import admin

class FavoriteAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "hospital",
    ]

admin.site.register(Favorite, FavoriteAdmin)