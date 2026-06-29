from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceRequestSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'hr':
            return Attendance.objects.all()
        return Attendance.objects.filter(employee=user)
    
    @action(detail=False, methods=['post'])
    def request(self, request):
        today = timezone.now().date()
        existing = Attendance.objects.filter(
            employee=request.user,
            date=today
        ).first()
        
        if existing:
            return Response(
                {'error': 'You already requested attendance for today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AttendanceRequestSerializer(data=request.data)
        if serializer.is_valid():
            attendance = Attendance.objects.create(
                employee=request.user,
                date=today,
                check_in_time=serializer.validated_data['check_in_time'],
                check_out_time=serializer.validated_data.get('check_out_time'),
                notes=serializer.validated_data.get('notes', ''),
                status='pending'
            )
            return Response(AttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        if request.user.role != 'hr':
            return Response(
                {'error': 'Only HR can view pending requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_requests = Attendance.objects.filter(status='pending')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put'])
    def approve(self, request, pk=None):
        attendance = self.get_object()
        
        if attendance.status != 'pending':
            return Response(
                {'error': f'This request is already {attendance.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.status = 'approved'
        attendance.approved_by = request.user
        attendance.approved_at = timezone.now()
        attendance.save()
        
        return Response({
            'status': 'approved',
            'message': 'Attendance request approved successfully'
        })
    
    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        attendance = self.get_object()
        
        if attendance.status != 'pending':
            return Response(
                {'error': f'This request is already {attendance.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rejection_reason = request.data.get('reason', 'No reason provided')
        
        attendance.status = 'rejected'
        attendance.approved_by = request.user
        attendance.approved_at = timezone.now()
        attendance.notes = f"{attendance.notes}\n\nRejection Reason: {rejection_reason}"
        attendance.save()
        
        return Response({
            'status': 'rejected',
            'message': 'Attendance request rejected'
        })
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        attendance = Attendance.objects.filter(employee=request.user).order_by('-date')
        serializer = self.get_serializer(attendance, many=True)
        return Response(serializer.data)