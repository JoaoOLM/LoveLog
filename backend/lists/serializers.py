from rest_framework import serializers
from .models import List, Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'completed']


class ListSerializer(serializers.ModelSerializer):
    items = ItemSerializer(source='item_set', many=True, read_only=True)

    class Meta:
        model = List
        fields = ['id', 'name', 'items']
