from django.db import models
from couples.models import Couple

class Board(models.Model):
    """
    Modelo para quadro/board do casal
    """
    couple = models.OneToOneField(
        Couple, 
        on_delete=models.CASCADE,
        related_name='board',
        help_text='Casal proprietário do board'
    )
    content = models.JSONField(
        blank=True, 
        null=True,
        default=dict,
        help_text='Conteúdo do board em formato JSON'
    )
    
    # Campos adicionais úteis
    title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text='Título do board'
    )
    background_color = models.CharField(
        max_length=7,
        default='#ffffff',
        help_text='Cor de fundo em hexadecimal'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadados opcionais
    is_private = models.BooleanField(
        default=False,
        help_text='Board privado (visível apenas para o casal)'
    )
    last_edited_by = models.ForeignKey(
        'couples.User',  # Ajuste conforme seu modelo User
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='edited_boards',
        help_text='Último usuário que editou o board'
    )
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Board'
        verbose_name_plural = 'Boards'
    
    def __str__(self):
        title = self.title or 'Board'
        return f'{title} de {self.couple.name}'
    
    def save(self, *args, **kwargs):
        """Override para garantir que content seja um dict se estiver vazio"""
        if not self.content:
            self.content = {}
        super().save(*args, **kwargs)
    
    @property
    def has_content(self):
        """Verifica se o board tem conteúdo"""
        return bool(self.content and any(self.content.values()))
    
    @property
    def content_preview(self):
        """Retorna uma prévia do conteúdo para admin"""
        if not self.has_content:
            return "Board vazio"
        
        # Se o content tiver uma estrutura específica, adapte aqui
        content_str = str(self.content)
        return content_str[:100] + "..." if len(content_str) > 100 else content_str