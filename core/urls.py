from django.urls import path
from core import views
urlpatterns = [
    path('', views.index, name="index"),
    path('graph', views.graph, name="graph"),
    path('favorite', views.favorite, name="favorite"),
]