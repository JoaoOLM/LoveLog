from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import List, Item
from .serializers import ListSerializer, ItemSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# Error message constants
NAME_REQUIRED_ERROR = "Name is required."
LIST_NOT_FOUND_ERROR = "List not found."
ITEM_NOT_FOUND_ERROR = "Item not found."
NAME_AND_COMPLETED_REQUIRED_ERROR = "Name and completed are required."

# Lista e criação de listas
@method_decorator(csrf_exempt, name='dispatch')
class ListListView(APIView):
    def get(self, request):
        lists = List.objects.prefetch_related('item_set').order_by('name')
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({"error": NAME_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)
        list_obj = List.objects.create(name=name)
        serializer = ListSerializer(list_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Detalhes, atualização e remoção de uma lista
class ListDetailView(APIView):
    def get(self, request, pk):
        try:
            list_obj = List.objects.prefetch_related('item_set').get(id=pk)
        except List.DoesNotExist:
            return Response({"error": LIST_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListSerializer(list_obj)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response({"error": LIST_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        if not name:
            return Response({"error": NAME_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)

        list_obj.name = name
        list_obj.save()
        serializer = ListSerializer(list_obj)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response({"error": LIST_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        list_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@method_decorator(csrf_exempt, name='dispatch')
class ItemListView(APIView):
    def get(self, request, list_id):
        try:
            list_obj = List.objects.get(id=list_id)
        except List.DoesNotExist:
            return Response({"error": LIST_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        items = Item.objects.filter(list=list_obj).order_by('id')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, list_id):
        name = request.data.get('name')

        if not name:
            return Response({"error": NAME_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)

        try:
            list_obj = List.objects.get(id=list_id)
        except List.DoesNotExist:
            return Response({"error": LIST_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        item = Item.objects.create(list=list_obj, name=name, completed=False)
        serializer = ItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ItemDetailView(APIView):
    def get(self, request, list_id, item_id):
        try:
            item = Item.objects.get(id=item_id, list_id=list_id)
        except Item.DoesNotExist:
            return Response({"error": ITEM_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        serializer = ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, list_id, item_id):
        try:
            item = Item.objects.get(id=item_id, list_id=list_id)
        except Item.DoesNotExist:
            return Response({"error": ITEM_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        completed = request.data.get('completed')

        if name is None or completed is None:
            return Response({"error": NAME_AND_COMPLETED_REQUIRED_ERROR}, status=status.HTTP_400_BAD_REQUEST)

        item.name = name
        item.completed = completed
        item.save()
        serializer = ItemSerializer(item)
        return Response(serializer.data)

    def delete(self, request, list_id, item_id):
        try:
            item = Item.objects.get(id=item_id, list_id=list_id)
        except Item.DoesNotExist:
            return Response({"error": ITEM_NOT_FOUND_ERROR}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

