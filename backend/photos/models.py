from django.db import models
from couples.models import Couple

class Photo(models.Model):
    """
    Modelo para fotos do casal
    """
    couple = models.ForeignKey(
        Couple, 
        on_delete=models.CASCADE, 
        related_name='photos'
    )
    image = models.ImageField(
        upload_to='couple_photos/',  # Organiza por pasta
        help_text='Foto do casal'
    )
    
    # Campos adicionais úteis
    caption = models.TextField(
        blank=True, 
        null=True, 
        help_text='Legenda da foto'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadados opcionais
    is_favorite = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(
        'couples.User',  # Ajuste conforme seu modelo User
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_photos',
        help_text='Usuário que fez upload da foto'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Foto'
        verbose_name_plural = 'Fotos'
    
    def __str__(self):
        return f"Foto de {self.couple.name} - {self.created_at.strftime('%d/%m/%Y')}"
    
    def delete(self, *args, **kwargs):
        """Override para deletar o arquivo físico também"""
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)