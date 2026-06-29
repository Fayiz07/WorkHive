from rest_framework import serializers
from .models import Performance

class PerformanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Performance
        fields = ['id', 'employee', 'employee_name', 'reviewer', 'reviewer_name', 'review_date', 'rating', 'feedback', 'goals']