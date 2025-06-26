import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class User(AbstractUser):
    """
    Usuário customizado que estende o User padrão do Django
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    # Usar email como username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='couples_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='couples_user_permissions_set',
        related_query_name='user',
    )
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class Couple(models.Model):
    """
    Modelo que representa um casal
    """
    name = models.CharField(max_length=100)
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos para os dois membros do casal
    partner1 = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='couple_as_partner1',
        null=True,
        blank=True
    )
    partner2 = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='couple_as_partner2',
        null=True,
        blank=True
    )
    
    def clean(self):
        """Validação customizada"""
        if self.partner1 and self.partner2 and self.partner1 == self.partner2:
            raise ValidationError("Os dois parceiros não podem ser a mesma pessoa.")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def is_complete(self):
        """Verifica se o casal tem os dois parceiros"""
        return self.partner1 is not None and self.partner2 is not None
    
    def get_partner(self, user):
        """Retorna o parceiro do usuário fornecido"""
        if self.partner1 == user:
            return self.partner2
        elif self.partner2 == user:
            return self.partner1
        return None
    
    def has_user(self, user):
        """Verifica se o usuário faz parte deste casal"""
        return user in [self.partner1, self.partner2]
    
    def __str__(self):
        partners = []
        if self.partner1:
            partners.append(self.partner1.first_name)
        if self.partner2:
            partners.append(self.partner2.first_name)
        
        if partners:
            return f"{' & '.join(partners)} ({self.name})"
        return f"{self.name} ({self.code})"

class CoupleInvitation(models.Model):
    """
    Modelo para gerenciar convites para formar casais
    """
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    EXPIRED = 'expired'
    
    STATUS_CHOICES = [
        (PENDING, 'Pendente'),
        (ACCEPTED, 'Aceito'),
        (REJECTED, 'Rejeitado'),
        (EXPIRED, 'Expirado'),
    ]
    
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invited_email = models.EmailField()
    invited_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_invitations',
        null=True,
        blank=True
    )
    
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    message = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        unique_together = ['couple', 'invited_email']
    
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"Convite de {self.inviter.first_name} para {self.invited_email}"