from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Couple
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class CoupleLoginView(APIView):
    def post(self, request):
        name = request.data.get('name')
        password = request.data.get('password')
        
        couples = Couple.objects.filter(name=name)
        
        for couple in couples:
            if couple.check_password(password):
                return Response({'code': str(couple.code)}, status=status.HTTP_200_OK)
        
        return Response({'error', 'Nome ou senha inválidos'}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        # Lê o header Authorization
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('LoveLog '):
            return Response({'error': 'Cabeçalho de autorização inválido'}, status=status.HTTP_401_UNAUTHORIZED)

        couple_code = auth_header.split(' ')[1]

        try:
            couple = Couple.objects.get(code=couple_code)
            return Response({'authenticated': True, 'name': couple.name}, status=status.HTTP_200_OK)
        except Couple.DoesNotExist:
            return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)
