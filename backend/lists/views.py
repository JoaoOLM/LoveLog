from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import List, Item
from couples.permissions import IsInCouple
from couples.mixins import CoupleViewMixin
from .serializers import ListSerializer, ItemSerializer


class ListViewSet(viewsets.ModelViewSet, CoupleViewMixin):
    """
    ViewSet completo para Lists
    """
    permission_classes = [IsAuthenticated, IsInCouple]
    serializer_class = ListSerializer
    
    def get_queryset(self):
        """Retorna apenas as listas do casal do usuário"""
        couple = self.get_user_couple()
        if not couple:
            return List.objects.none()
        return List.objects.filter(couple=couple).prefetch_related('item_set').order_by('name')
    
    def perform_create(self, serializer):
        """Associa automaticamente o casal ao criar uma lista"""
        couple = self.get_user_couple()
        serializer.save(couple=couple)


class ItemViewSet(viewsets.ModelViewSet, CoupleViewMixin):
    """
    ViewSet completo para Items
    """
    permission_classes = [IsAuthenticated, IsInCouple]
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        """Retorna apenas os itens das listas do casal do usuário"""
        couple = self.get_user_couple()
        if not couple:
            return Item.objects.none()
        return Item.objects.filter(list__couple=couple).order_by('id')
    
    def perform_create(self, serializer):
        """Valida se a lista pertence ao casal antes de criar o item"""
        couple = self.get_user_couple()
        list_obj = serializer.validated_data.get('list')
        
        # Verifica se a lista pertence ao casal
        if list_obj.couple != couple:
            return Response(
                {"error": "Você não tem permissão para alterar essa lista."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    @action(detail=False, methods=['get'], url_path='by-list/(?P<list_id>[^/.]+)')
    def by_list(self, request, list_id=None):
        """Endpoint customizado para buscar itens por lista"""
        couple = self.get_user_couple()
        if not couple:
            return Response(
                {"error": "Você não faz parte de nenhum casal"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            list_obj = List.objects.get(id=list_id, couple=couple)
        except List.DoesNotExist:
            return Response(
                {"error": "Lista não encontrada."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        items = Item.objects.filter(list=list_obj).order_by('id')
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='add-to-list/(?P<list_id>[^/.]+)')
    def add_to_list(self, request, list_id=None):
        """Endpoint customizado para adicionar item a uma lista específica"""
        couple = self.get_user_couple()
        if not couple:
            return Response(
                {"error": "Você não faz parte de nenhum casal"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            list_obj = List.objects.get(id=list_id, couple=couple)
        except List.DoesNotExist:
            return Response(
                {"error": "Lista não encontrada."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        name = request.data.get('name')
        if not name:
            return Response(
                {"error": "Nome é obrigatório."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item = Item.objects.create(list=list_obj, name=name, completed=False)
        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)