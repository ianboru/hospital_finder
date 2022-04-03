from pyexpat import model
from django.db import models

from django.contrib.auth.models import User
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hospital = models.CharField("hospital", max_length=500)