from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import Board
from couples.permissions import IsInCouple
from couples.mixins import CoupleViewMixin
from .serializers import BoardSerializer


class BoardViewSet(viewsets.ModelViewSet, CoupleViewMixin):
    """
    ViewSet completo para Board
    """
    permission_classes = [IsAuthenticated, IsInCouple]
    serializer_class = BoardSerializer
    
    def get_queryset(self):
        """Retorna apenas o board do casal do usuário"""
        couple = self.get_user_couple()
        if not couple:
            return Board.objects.none()
        return Board.objects.filter(couple=couple)
    
    def get_object(self):
        """Override para retornar sempre o board do casal, criando se necessário"""
        couple = self.get_user_couple()
        if not couple:
            raise PermissionDenied("Você não faz parte de nenhum casal")
        
        board, created = Board.objects.get_or_create(couple=couple)
        return board
    
    def list(self, request):
        """Retorna o board do casal (sempre há apenas um)"""
        board = self.get_object()
        serializer = self.get_serializer(board)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Retorna o board específico (se pertence ao casal)"""
        board = self.get_object()
        # Verifica se o pk solicitado é realmente do board do casal
        if str(board.pk) != str(pk):
            return Response(
                {"error": "Board não encontrado."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(board)
        return Response(serializer.data)
    
    def create(self, request):
        """Atualiza o board existente (já que sempre existe um por casal)"""
        return self.update_board_content(request)
    
    def update(self, request, pk=None):
        """Atualiza o board"""
        return self.update_board_content(request, pk)
    
    def partial_update(self, request, pk=None):
        """Atualização parcial do board"""
        return self.update_board_content(request, pk, partial=True)
    
    def destroy(self, request, pk=None):
        """Limpa o conteúdo do board em vez de deletar"""
        board = self.get_object()
        if str(board.pk) != str(pk):
            return Response(
                {"error": "Board não encontrado."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        board.content = {}
        board.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update_board_content(self, request, pk=None, partial=False):
        """Método auxiliar para atualizar conteúdo do board"""
        board = self.get_object()
        
        # Se pk foi fornecido, verifica se é o board correto
        if pk and str(board.pk) != str(pk):
            return Response(
                {"error": "Board não encontrado."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(board, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['patch'])
    def update_content(self, request):
        """Endpoint específico para atualizar apenas o conteúdo"""
        board = self.get_object()
        
        content = request.data.get('content')
        if content is None:
            return Response(
                {"error": "Conteúdo é obrigatório."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        board.content = content
        board.save()
        
        serializer = self.get_serializer(board)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_content(self, request):
        """Limpa todo o conteúdo do board"""
        board = self.get_object()
        board.content = {}
        board.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def content_only(self, request):
        """Retorna apenas o conteúdo do board"""
        board = self.get_object()
        return Response({"content": board.content or {}})