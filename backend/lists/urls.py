from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListViewSet, ItemViewSet

router = DefaultRouter()
router.register(r'lists', ListViewSet, basename='list')
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]