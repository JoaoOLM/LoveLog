from django.urls import path
from .views import CoupleLoginView

urlpatterns = [
    path('login/', CoupleLoginView.as_view()),
]

