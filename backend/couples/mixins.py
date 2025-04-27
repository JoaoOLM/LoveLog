from rest_framework.exceptions import AuthenticationFailed
from .models import Couple

class CoupleAuthMixin:
    def get_couple(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('LoveLog '):
            raise AuthenticationFailed('Authorization header missing or invalid.')
        
        code = auth_header.split('')[1]
        
        try:
            couple = Couple.objects.get(code=code)
            return couple
        except Couple.DoesNotExist:
            raise AuthenticationFailed('Invalid couple code.')