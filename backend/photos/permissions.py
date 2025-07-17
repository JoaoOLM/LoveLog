from rest_framework.permissions import BasePermission

class IsCoupleMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        return obj.couple.user1 == user or obj.couple.user2 == user