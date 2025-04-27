from django.contrib import admin
from .models import Couple

# Register your models here.
@admin.register(Couple)
class CoupleAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name',)