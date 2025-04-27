from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Photo
from couples.mixins import CoupleAuthMixin

# Create your views here.
class PhotoListCreateView(APIView, CoupleAuthMixin):
    def get(self, request):
        couple = self.get_couple(request)
        photos = Photo.objects.filter(couple=couple)
        data = [{"id": p.id, "url": p.image.url} for p in photos]
        return Response(data)
    
    def post(self, request):
        couple = self.get_couple(request)
        image = request.FILES.get('image')
        
        if not image:
            return Response({"error" : "Image is required."}, status=status.HTTP_400_BAD_REQUEST)
        photo = Photo.objects.create(couple=couple, image=image)
        return Response({"id": photo.id, "url": photo.image.url}, status=status.HTTP_201_CREATED)
    
class PhotoDeleteView(APIView, CoupleAuthMixin):
    def delete(self, request, photo_id):
        couple = self.get_couple(request)
        try:
            photo = Photo.objects.filter(id=photo_id, couple=couple)        
        except Photo.DoesNotExist:
            return Response({"error": "Photo not found."}, status=status.HTTP_404_NOT_FOUND)
        
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
