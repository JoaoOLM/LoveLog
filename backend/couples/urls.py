from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    
    # Gerenciamento de casais
    path('couples/create/', views.create_couple, name='create_couple'),
    path('couples/my-couple/', views.get_user_couple, name='get_user_couple'),
    
    # Convites
    path('invitations/accept/', views.accept_invitation, name='accept_invitation'),
    path('invitations/pending/', views.get_pending_invitations, name='get_pending_invitations'),
]