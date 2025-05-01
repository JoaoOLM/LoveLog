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
    
    def save(self, *args, **kwargs):
        # Se a senha não for criptografada, criptografa antes de salvar
        if self.password and not self.password.startswith('$'):  # Verifica se a senha não está criptografada
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"