import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# Create your models here.
class Couple(models.Model):
    name = models.CharField(max_length=100)  
    password = models.CharField(max_length=128) 
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)  # Identificador único

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.name} ({self.code})"