from django.urls import path, include
from core import views
urlpatterns = [
    path('', views.index, name="index"),
    path('graph', views.graph, name="graph"),
    path('favorite', views.favorite, name="favorite"),
    path("accounts/", include("django.contrib.auth.urls")),
    path("signup/", views.SignUpView.as_view(), name="signup"),

]