from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import Couple
from ..serializers import CoupleSerializer

class CoupleViewSet(viewsets.ModelViewSet):
    queryset = Couple.objects.all()
    serializer_class = CoupleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Couple.objects.filter(user1=self.request.user) | Couple.objects.filter(user2=self.request.user)

    @action(detail=False, methods=["get"])
    def my_couple(self, request):
        couple = self.get_queryset().first()
        serializer = self.get_serializer(couple)
        return Response(serializer.data)
