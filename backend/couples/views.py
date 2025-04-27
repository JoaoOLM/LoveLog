from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Couple

# Create your views here.
class CoupleLoginView(APIView):
    def post(self, request):
        name = request.data.get('name')
        password = request.data.get('password')
        
        couples = Couple.objects.filter(name=name)
        
        for couple in couples:
            if couple.check_password(password):
                return Response({'code': str(couple.code)}, status=status.HTTP_200_OK)
        
        return Response({'error', 'Nome ou senha inválidos'}, status=status.HTTP_400_BAD_REQUEST)