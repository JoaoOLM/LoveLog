from rest_framework.permissions import BasePermission
from .models import List, Item


class IsCoupleMember(BasePermission):
    """
    Permite acesso apenas a usuários que fazem parte do casal dono do objeto.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, List):
            return obj.couple.user1 == request.user or obj.couple.user2 == request.user
        elif isinstance(obj, Item):
            return obj.list.couple.user1 == request.user or obj.list.couple.user2 == request.user
        return False
