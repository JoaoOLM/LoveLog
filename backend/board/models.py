from django.db import models

# Create your models here.
class Board(models.Model):
    content = models.JSONField(blank=True, null=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Board"
        verbose_name_plural = "Board"  # Singular porque só deve existir um
    
    def save(self, *args, **kwargs):
        # Garantir que só existe um board
        if not self.pk and Board.objects.exists():
            raise ValueError("Só pode existir um board no sistema")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_instance(cls):
        """Retorna a instância única do board, criando se necessário"""
        board, _ = cls.objects.get_or_create(pk=1, defaults={'content': {}})
        return board
    
    def __str__(self):
        return 'Board Principal'