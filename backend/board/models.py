from django.db import models

# Create your models here.
class Board(models.Model):
    content = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return ''