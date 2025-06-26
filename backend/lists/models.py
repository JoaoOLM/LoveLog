# models.py para Lists
from django.db import models
from couples.models import Couple

class List(models.Model):
    """
    Modelo para listas do casal
    """
    couple = models.ForeignKey(
        Couple, 
        on_delete=models.CASCADE, 
        related_name='lists',
        help_text='Casal proprietário da lista'
    )
    name = models.CharField(
        max_length=100,
        help_text='Nome da lista'
    )
    
    # Campos adicionais úteis
    description = models.TextField(
        blank=True, 
        null=True, 
        help_text='Descrição da lista'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadados opcionais
    is_archived = models.BooleanField(
        default=False,
        help_text='Lista arquivada'
    )
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Baixa'),
            ('medium', 'Média'),
            ('high', 'Alta'),
        ],
        default='medium',
        help_text='Prioridade da lista'
    )
    created_by = models.ForeignKey(
        'couples.User',  # Ajuste conforme seu modelo User
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_lists',
        help_text='Usuário que criou a lista'
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Lista'
        verbose_name_plural = 'Listas'
        unique_together = [['couple', 'name']]  # Evita listas duplicadas por casal
    
    def __str__(self):
        return f'{self.name} ({self.couple.name})'
    
    @property
    def total_items(self):
        """Retorna o total de itens na lista"""
        return self.items.count()
    
    @property
    def completed_items(self):
        """Retorna o total de itens completados"""
        return self.items.filter(completed=True).count()
    
    @property
    def completion_percentage(self):
        """Retorna a porcentagem de conclusão da lista"""
        total = self.total_items
        if total == 0:
            return 0
        return round((self.completed_items / total) * 100, 2)


class Item(models.Model):
    """
    Modelo para itens de uma lista
    """
    list = models.ForeignKey(
        List, 
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Lista',
        help_text='Lista à qual este item pertence'
    )
    name = models.CharField(
        max_length=255,
        help_text='Nome do item'
    )
    completed = models.BooleanField(
        default=False,
        help_text='Item completado'
    )
    
    # Campos adicionais úteis
    description = models.TextField(
        blank=True, 
        null=True, 
        help_text='Descrição detalhada do item'
    )
    due_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text='Data limite para conclusão'
    )
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='Data/hora de conclusão'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Metadados opcionais
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Baixa'),
            ('medium', 'Média'),
            ('high', 'Alta'),
        ],
        default='medium',
        help_text='Prioridade do item'
    )
    assigned_to = models.ForeignKey(
        'couples.User',  # Ajuste conforme seu modelo User
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_items',
        help_text='Usuário responsável pelo item'
    )
    created_by = models.ForeignKey(
        'couples.User',  # Ajuste conforme seu modelo User
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_items',
        help_text='Usuário que criou o item'
    )
    
    class Meta:
        ordering = ['completed', '-priority', 'created_at']
        verbose_name = 'Item'
        verbose_name_plural = 'Itens'
    
    def __str__(self):
        status = "✓" if self.completed else "○"
        return f"{status} {self.name}"
    
    def save(self, *args, **kwargs):
        """Override para marcar data de conclusão automaticamente"""
        if self.completed and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)
    
    @property
    def is_overdue(self):
        """Verifica se o item está atrasado"""
        if not self.due_date or self.completed:
            return False
        from django.utils import timezone
        return timezone.now() > self.due_date