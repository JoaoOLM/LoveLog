# serializers.py
from rest_framework import serializers
from .models import Board


class BoardSerializer(serializers.ModelSerializer):
    """
    Serializer para Board
    """
    couple_name = serializers.CharField(source='couple.name', read_only=True)
    has_content = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = [
            'id',
            'couple',
            'couple_name',
            'content',
            'has_content',
            'created_at',
        ]
        read_only_fields = ['id', 'couple', 'couple_name', 'created_at']
    
    def get_has_content(self, obj):
        """Verifica se o board tem conteúdo"""
        return bool(obj.content and any(obj.content.values())) if obj.content else False
    
    def validate_content(self, value):
        """Validação personalizada para o campo content"""
        if value is None:
            return {}
        
        # Adicione validações específicas do seu conteúdo aqui
        # Por exemplo, se você espera certas chaves:
        # if 'required_field' not in value:
        #     raise serializers.ValidationError("Campo obrigatório não encontrado")
        
        return value
    
    def create(self, validated_data):
        """Override create - na prática não será usado pois sempre fazemos get_or_create"""
        couple = validated_data.get('couple')
        board, created = Board.objects.get_or_create(
            couple=couple,
            defaults=validated_data
        )
        return board
    
    def update(self, instance, validated_data):
        """Override update para logging ou comportamentos específicos"""
        # Remove couple dos validated_data se estiver presente (não deve ser alterado)
        validated_data.pop('couple', None)
        
        return super().update(instance, validated_data)