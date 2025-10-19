from django.urls import path, include
from core import views
urlpatterns = [
    path('', views.index, name="index"),
    path("signup/", views.SignUpView.as_view(), name="signup"),
    path("api/debug-places-data/", views.debug_places_data, name="debug_places_data"),

]