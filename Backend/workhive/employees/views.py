from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # All authenticated users can see all employees including HR
        return Employee.objects.all()

    def create(self, request, *args, **kwargs):
        user_id = request.data.get('user')
        if user_id:
            try:
                employee = Employee.objects.get(user_id=user_id)
                serializer = self.get_serializer(employee, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Employee.DoesNotExist:
                pass
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Only HR or the employee themselves can update their own record
        if request.user.role != 'hr' and instance.user != request.user:
            return Response(
                {'error': 'You can only update your own profile'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if request.user.role == 'hr' and 'role' in request.data:
            instance.user.role = request.data['role']
            instance.user.save()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Only HR can delete employee records
        if request.user.role != 'hr':
            return Response(
                {'error': 'Only HR can delete employee records'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        serializer.save()