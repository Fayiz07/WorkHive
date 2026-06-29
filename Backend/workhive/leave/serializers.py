from rest_framework import serializers
from .models import Leave

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    
    class Meta:
        model = Leave
        fields = ['id', 'employee', 'employee_name', 'leave_type', 'start_date', 
                  'end_date', 'reason', 'status', 'applied_on', 'approved_by']
        read_only_fields = ['id', 'employee', 'employee_name', 'status', 'applied_on', 'approved_by']