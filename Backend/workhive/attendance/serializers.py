from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'check_in_time', 
                  'check_out_time', 'status', 'notes', 'approved_by', 'approver_name', 'approved_at']
        read_only_fields = ['id', 'date', 'approved_at']

class AttendanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['check_in_time', 'check_out_time', 'notes']