from rest_framework import serializers
from .models import Employee
from accounts.serializers import UserSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'user_details', 'full_name', 'employee_id', 'department', 
                  'job_title', 'date_of_joining', 'salary', 'profile_picture']
        read_only_fields = ['id', 'user_details', 'full_name']
    
    def get_full_name(self, obj):
        if not obj.user:
            return 'Unknown'
        full_name = obj.user.get_full_name()
        return full_name.strip() if full_name.strip() else obj.user.username