from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import uuid

from .models import User, Couple, CoupleInvitation
from .serializers import UserSerializer, CoupleSerializer, CoupleInvitationSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Registra um novo usuário
    """
    data = request.data
    
    # Validações básicas
    if User.objects.filter(email=data.get('email')).exists():
        return Response(
            {'error': 'Este email já está em uso'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.create(
            username=data.get('email'),  # Usar email como username
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            password=make_password(data.get('password'))
        )
        
        # Criar token de autenticação
        token, created = Token.objects.get_or_create(user=user)
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'token': token.key,
            'message': 'Usuário criado com sucesso'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': 'Erro ao criar usuário'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """
    Faz login do usuário
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email e senha são obrigatórios'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=email, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        
        # Verificar se o usuário tem um casal
        couple = None
        if hasattr(user, 'couple_as_partner1'):
            couple = user.couple_as_partner1
        elif hasattr(user, 'couple_as_partner2'):
            couple = user.couple_as_partner2
        
        user_data = UserSerializer(user).data
        couple_data = CoupleSerializer(couple).data if couple else None
        
        return Response({
            'user': user_data,
            'couple': couple_data,
            'token': token.key,
            'message': 'Login realizado com sucesso'
        })
    else:
        return Response(
            {'error': 'Credenciais inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Faz logout do usuário (remove o token)
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout realizado com sucesso'})
    except:
        return Response({'error': 'Erro ao fazer logout'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_couple(request):
    """
    Cria um novo casal e convida um parceiro
    """
    user = request.user
    
    # Verificar se o usuário já está em um casal
    if hasattr(user, 'couple_as_partner1') or hasattr(user, 'couple_as_partner2'):
        return Response(
            {'error': 'Você já faz parte de um casal'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    couple_name = request.data.get('couple_name')
    partner_email = request.data.get('partner_email')
    message = request.data.get('message', '')
    
    if not couple_name or not partner_email:
        return Response(
            {'error': 'Nome do casal e email do parceiro são obrigatórios'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if partner_email == user.email:
        return Response(
            {'error': 'Você não pode convidar a si mesmo'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Criar o casal com apenas um parceiro
        couple = Couple.objects.create(
            name=couple_name,
            partner1=user
        )
        
        # Criar convite
        invitation = CoupleInvitation.objects.create(
            couple=couple,
            inviter=user,
            invited_email=partner_email,
            message=message,
            expires_at=timezone.now() + timedelta(days=7)  # Expira em 7 dias
        )
        
        # Enviar email de convite (implementar conforme suas configurações de email)
        send_invitation_email(invitation)
        
        return Response({
            'couple': CoupleSerializer(couple).data,
            'invitation': CoupleInvitationSerializer(invitation).data,
            'message': 'Casal criado e convite enviado com sucesso'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': 'Erro ao criar casal'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request):
    """
    Aceita um convite para formar um casal
    """
    user = request.user
    invitation_code = request.data.get('invitation_code')
    
    if not invitation_code:
        return Response(
            {'error': 'Código do convite é obrigatório'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        invitation = CoupleInvitation.objects.get(
            code=invitation_code,
            invited_email=user.email,
            status=CoupleInvitation.PENDING
        )
        
        if invitation.is_expired():
            invitation.status = CoupleInvitation.EXPIRED
            invitation.save()
            return Response(
                {'error': 'Este convite expirou'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se o usuário já está em um casal
        if hasattr(user, 'couple_as_partner1') or hasattr(user, 'couple_as_partner2'):
            return Response(
                {'error': 'Você já faz parte de um casal'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Aceitar o convite
        couple = invitation.couple
        couple.partner2 = user
        couple.save()
        
        invitation.status = CoupleInvitation.ACCEPTED
        invitation.invited_user = user
        invitation.save()
        
        return Response({
            'couple': CoupleSerializer(couple).data,
            'message': 'Convite aceito com sucesso! Vocês agora são um casal no LoveLog'
        })
        
    except CoupleInvitation.DoesNotExist:
        return Response(
            {'error': 'Convite inválido'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_couple(request):
    """
    Retorna o casal do usuário logado
    """
    user = request.user
    couple = None
    
    if hasattr(user, 'couple_as_partner1'):
        couple = user.couple_as_partner1
    elif hasattr(user, 'couple_as_partner2'):
        couple = user.couple_as_partner2
    
    if couple:
        return Response(CoupleSerializer(couple).data)
    else:
        return Response(
            {'message': 'Usuário não faz parte de nenhum casal'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_invitations(request):
    """
    Retorna os convites pendentes para o usuário
    """
    user = request.user
    invitations = CoupleInvitation.objects.filter(
        invited_email=user.email,
        status=CoupleInvitation.PENDING
    )
    
    # Filtrar convites não expirados
    valid_invitations = []
    for invitation in invitations:
        if invitation.is_expired():
            invitation.status = CoupleInvitation.EXPIRED
            invitation.save()
        else:
            valid_invitations.append(invitation)
    
    serializer = CoupleInvitationSerializer(valid_invitations, many=True)
    return Response(serializer.data)

def send_invitation_email(invitation):
    """
    Envia email de convite (implementar conforme suas configurações)
    """
    subject = f'{invitation.inviter.first_name} te convidou para formar um casal no LoveLog'
    
    message = f"""
    Olá!
    
    {invitation.inviter.first_name} {invitation.inviter.last_name} te convidou para formar o casal "{invitation.couple.name}" no LoveLog.
    
    {invitation.message if invitation.message else ''}
    
    Para aceitar o convite, faça login no app e use o código: {invitation.code}
    
    Este convite expira em {invitation.expires_at.strftime('%d/%m/%Y às %H:%M')}.
    
    Com amor,
    Equipe LoveLog
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [invitation.invited_email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Erro ao enviar email: {e}")  # Log do erro