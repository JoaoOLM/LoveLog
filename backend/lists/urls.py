from django.urls import path
from .views import ListView, ItemView

urlpatterns = [
    path('', ListView.as_view()),
    path('items/', ItemView.as_view()),
]
