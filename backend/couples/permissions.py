from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status

class IsInCouple(permissions.BasePermission):
    """
    Permissão customizada que verifica se o usuário faz parte de um casal
    """
    
    def has_permission(self, request, view):
        # Primeiro verifica se o usuário está autenticado
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verifica se o usuário faz parte de algum casal
        user = request.user
        has_couple = (
            hasattr(user, 'couple_as_partner1') and user.couple_as_partner1 is not None
        ) or (
            hasattr(user, 'couple_as_partner2') and user.couple_as_partner2 is not None
        )
        
        return has_couple

class CoupleObjectPermission(permissions.BasePermission):
    """
    Permissão que verifica se o objeto pertence ao casal do usuário
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user = request.user
        user_couple = None
        
        # Encontrar o casal do usuário
        if hasattr(user, 'couple_as_partner1') and user.couple_as_partner1:
            user_couple = user.couple_as_partner1
        elif hasattr(user, 'couple_as_partner2') and user.couple_as_partner2:
            user_couple = user.couple_as_partner2
        
        if not user_couple:
            return False
        
        # Verificar se o objeto pertence ao casal do usuário
        return hasattr(obj, 'couple') and obj.couple == user_couple