from django.contrib import admin
from .models import User, Couple

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name')
    search_fields = ('email', 'first_name', 'last_name')

@admin.register(Couple)
class CoupleAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name',)