from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Photo
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import os

# Error message constants
IMAGE_REQUIRED_ERROR = "Image is required."
PHOTO_NOT_FOUND_ERROR = "Photo not found."

# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class PhotoListCreateView(APIView):
    def get(self, request):
        photos = Photo.objects.all()
        data = [{"id": p.id, "url": p.image.url} for p in photos]
        return Response(data)
    
    def post(self, request):
        image = request.FILES.get('image')
        
        if not image:
            return Response({"error": IMAGE_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)
        photo = Photo.objects.create(image=image)
        return Response({"id": photo.id, "url": photo.image.url}, status=status.HTTP_201_CREATED)
    
class PhotoDeleteView(APIView):
    def delete(self, request, photo_id):
        try:
            photo = Photo.objects.get(id=photo_id)        
        except Photo.DoesNotExist:
            return Response({"error": PHOTO_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)
        
        # Deletar o arquivo físico se existir
        if photo.image and os.path.isfile(photo.image.path):
            try:
                os.remove(photo.image.path)
            except OSError:
                # Se não conseguir deletar o arquivo, continue com a exclusão do registro
                pass
        
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
