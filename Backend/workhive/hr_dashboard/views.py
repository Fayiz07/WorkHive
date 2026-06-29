from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Event, Promotion, EmployeeOfTheYear
from .serializers import EventSerializer, PromotionSerializer, EmployeeOfTheYearSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EmployeeOfTheYearViewSet(viewsets.ModelViewSet):
    queryset = EmployeeOfTheYear.objects.all()
    serializer_class = EmployeeOfTheYearSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)