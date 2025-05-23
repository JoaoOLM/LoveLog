from django.urls import path
from .views import ListListView, ListDetailView, ItemListView, ItemDetailView

urlpatterns = [
    path('', ListListView.as_view(), name='list-list'),
    path('<int:pk>/', ListDetailView.as_view(), name='list-detail'),
    path('<int:list_id>/items/', ItemListView.as_view(), name='item-list'),
    path('<int:list_id>/items/<int:item_id>/', ItemDetailView.as_view(), name='item-detail'),
]

