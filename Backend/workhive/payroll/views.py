from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Payroll
from .serializers import PayrollSerializer
from accounts.permissions import IsHR

# Create your views here.

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsHR]
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'hr':
            return Payroll.objects.all()
        return Payroll.objects.filter(employee=user)

