from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import Photo
from couples.permissions import IsInCouple, CoupleObjectPermission
from couples.mixins import CoupleViewMixin

class PhotoViewSet(viewsets.ModelViewSet, CoupleViewMixin):
    """
    ViewSet completo para Photos
    """
    permission_classes = [IsAuthenticated, IsInCouple]
    
    def get_queryset(self):
        """Retorna apenas as fotos do casal do usuário"""
        couple = self.get_user_couple()
        if not couple:
            return Photo.objects.none()
        return Photo.objects.filter(couple=couple).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Associa automaticamente o casal ao criar uma foto"""
        couple = self.get_user_couple()
        serializer.save(couple=couple)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Endpoint customizado para fotos recentes"""
        couple = self.get_user_couple()
        if not couple:
            return Response(
                {"error": "Você não faz parte de nenhum casal"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        recent_photos = Photo.objects.filter(couple=couple).order_by('-created_at')[:10]
        data = [
            {
                "id": photo.id,
                "url": request.build_absolute_uri(photo.image.url)
            }
            for photo in recent_photos
        ]
        
        return Response({"recent_photos": data})