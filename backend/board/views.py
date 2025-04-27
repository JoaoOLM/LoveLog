from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Board
from couples.mixins import CoupleAuthMixin

# Create your views here.
class BoardView(APIView, CoupleAuthMixin):
    def get(self, request):
        couple = self.get_couple(request)
        board, created = Board.objects.get_or_create(couple=couple)
        return Response({"id": board.id, "content": board.content})
        
    def post(self, request):
        couple = self.get_couple(request)
        content = request.data.get('content')

        if not content:
            return Response({"error": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        board, created = Board.objects.get_or_create(couple=couple)
        board.content = content
        board.save()
        return Response({"id": board.id, "content": board.content}, status=status.HTTP_200_OK)
        
    def delete(self, request):
        couple = self.get_couple(request)
        board, created = Board.objects.get_or_create(couple=couple)
        board.content = ""
        board.save()
        return Response(status=status.HTTP_204_NO_CONTENT)