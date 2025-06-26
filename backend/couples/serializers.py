from rest_framework import serializers
from .models import User, Couple, CoupleInvitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class CoupleSerializer(serializers.ModelSerializer):
    partner1 = UserSerializer(read_only=True)
    partner2 = UserSerializer(read_only=True)
    is_complete = serializers.ReadOnlyField()
    
    class Meta:
        model = Couple
        fields = [
            'id', 'name', 'code', 'partner1', 'partner2', 
            'is_complete', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']

class CoupleInvitationSerializer(serializers.ModelSerializer):
    inviter = UserSerializer(read_only=True)
    invited_user = UserSerializer(read_only=True)
    couple_name = serializers.CharField(source='couple.name', read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = CoupleInvitation
        fields = [
            'id', 'code', 'inviter', 'invited_email', 'invited_user',
            'couple_name', 'status', 'message', 'is_expired',
            'created_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'code', 'inviter', 'invited_user', 'couple_name',
            'is_expired', 'created_at'
        ]