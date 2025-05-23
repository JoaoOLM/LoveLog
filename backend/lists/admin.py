from django.contrib import admin
from .models import List, Item

# Register your models here.
@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ('name', 'couple', 'created_at')
    search_fields = ('name', 'couple__name',)
    list_filter = ('created_at',)
    
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'completed', 'list', 'created_at')
    search_fields = ('name', 'list__name')
    list_filter = ('completed', 'created_at')