from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import List, Item
from django.db.models import Prefetch
from couples.mixins import CoupleAuthMixin

# Create your views here.
class ListView(APIView, CoupleAuthMixin):
    def get(self, request):
        couple = self.get_couple(request)
        # prefetch todos os itens de cada lista sem filtrar por couple
        lists = (
            List.objects
                .filter(couple=couple)
                .prefetch_related(
                    Prefetch(
                        'item_set',  # ou use o related_name se você tiver definido outro
                        queryset=Item.objects.order_by('id'),
                        to_attr='itens_obj'
                    )
                )
                .order_by('name')
        )

        data = [
            {
                "id": l.id,
                "nome": l.name,
                "itens": [
                    {"id": i.id, "nome": i.name}
                    for i in getattr(l, 'itens_obj', [])
                ]
            }
            for l in lists
        ]

        return Response(data)
        
    def post(self, request):
        couple = self.get_couple(request)
        name = request.data.get('name')
        
        if not name:
            return Response({"error" : "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
        list_obj = List.objects.create(couple=couple, name=name)
        return Response({"id": list_obj.id, "nome": list_obj.name}, status=status.HTTP_201_CREATED)
    
class ItemView(APIView, CoupleAuthMixin):
    def get(self, request):
        couple = self.get_couple(request)
        list_id = request.query_params.get('list')
        
        if not list_id:
            return Response({"error": "List ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            list_obj = List.objects.get(id=list_id, couple=couple)
        except List.DoesNotExist:
            return Response({"error": "List not found."}, status=status.HTTP_404_NOT_FOUND)
        
        items = Item.objects.filter(couple=couple, list=list_obj)
        data = [{"id": i.id, "nome": i.name} for i in items]
        return Response(data)
        
        
    def post(self, request):
        couple = self.get_couple(request)
        list_id = request.data.get('list')
        name = request.data.get('name')
        
        if not name or not list_id:
            return Response({"error" : "Name and List are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            list_obj = List.objects.get(id=list_id, couple=couple)
        except List.DoesNotExist:
            return Response({"error": "List not found."}, status=status.HTTP_404_NOT_FOUND)
        
        item = Item.objects.create(couple=couple, list=list_obj, name=name)
        return Response({"id" : item.id, "nome" : item.name}, status=status.HTTP_201_CREATED)