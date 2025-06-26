from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

class CoupleViewMixin:
    """
    Mixin que fornece métodos úteis para views relacionadas a casais
    """
    
    def get_user_couple(self):
        """
        Retorna o casal do usuário autenticado ou None se não tiver
        """
        user = self.request.user
        
        if hasattr(user, 'couple_as_partner1') and user.couple_as_partner1:
            return user.couple_as_partner1
        elif hasattr(user, 'couple_as_partner2') and user.couple_as_partner2:
            return user.couple_as_partner2
        
        return None
    
    def get_couple_or_error(self):
        """
        Retorna o casal do usuário ou levanta um erro se não tiver
        """
        couple = self.get_user_couple()
        if not couple:
            return None, Response(
                {"error": "Você não faz parte de nenhum casal"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return couple, None
    
    def get_couple_object_or_404(self, model, **kwargs):
        """
        Busca um objeto que pertence ao casal do usuário ou retorna 404
        """
        couple = self.get_user_couple()
        if not couple:
            return None
        
        return get_object_or_404(model, couple=couple, **kwargs)
    
    def check_couple_access(self, obj):
        """
        Verifica se o usuário tem acesso ao objeto (se pertence ao seu casal)
        """
        user_couple = self.get_user_couple()
        if not user_couple:
            return False
        
        return hasattr(obj, 'couple') and obj.couple == user_couple