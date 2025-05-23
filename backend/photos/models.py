from django.db import models
from couples.models import Couple

# Create your models here.
class Photo(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, verbose_name='photos')
    image = models.ImageField(upload_to='photos/')
    uploaded_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f'Photo {self.id} from couple {self.couple.name}'    
    