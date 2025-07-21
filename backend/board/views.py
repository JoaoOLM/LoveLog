from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Board
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Error message constants
CONTENT_REQUIRED_ERROR = "Content is required."
BOARD_NOT_FOUND_ERROR = "Board not found."

# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class BoardView(APIView):
    def get(self, request):
        board = Board.get_instance()
        return Response({"id": board.id, "content": board.content})
        
    def post(self, request):
        content = request.data.get('content')

        if not content:
            return Response({"error": CONTENT_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)
        
        board = Board.get_instance()
        board.content = content
        board.save()
        return Response({"id": board.id, "content": board.content}, status=status.HTTP_200_OK)
    
    def put(self, request):
        board = Board.get_instance()
        
        content = request.data.get('content')
        if not content:
            return Response({"error": CONTENT_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)
        
        board.content = content
        board.save()
        return Response({"id": board.id, "content": board.content}, status=status.HTTP_200_OK)
        
    def delete(self, request):
        board = Board.get_instance()
        board.content = {}
        board.save()
        return Response(status=status.HTTP_204_NO_CONTENT)