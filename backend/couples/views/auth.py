from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({"detail": "Login successful", "username": user.username})
    return JsonResponse({"detail": "Invalid credentials"}, status=401)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Logout successful"})
