from django.db import models
from couples.models import Couple

# Create your models here.
class Board(models.Model):
    couple = models.OneToOneField(Couple, on_delete=models.CASCADE)
    content = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Board from {self.couple}'