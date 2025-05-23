from django.db import models
from couples.models import Couple

# Create your models here.
class List(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.name} ({self.couple.name})'
        
        
class Item(models.Model):
    name = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE, verbose_name='List')
    
    def __str__(self):
        return self.name