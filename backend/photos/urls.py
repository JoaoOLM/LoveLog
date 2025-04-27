from django.urls import path
from .views import PhotoListCreateView, PhotoDeleteView

urlpatterns = [
    path("", PhotoListCreateView.as_view()),
    path("{id}", PhotoDeleteView.as_view())
]
