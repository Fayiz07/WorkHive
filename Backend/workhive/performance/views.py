from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Performance
from .serializers import PerformanceSerializer
from accounts.permissions import IsHR

# Create your views here.

class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsHR]
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]
    
    def get_queryset(self):
        # All authenticated users can read all reviews (used in Staff Directory).
        # Write access is restricted to HR via get_permissions above.
        return Performance.objects.all()
