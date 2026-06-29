from rest_framework import serializers
from .models import Event, Promotion, EmployeeOfTheYear
from employees.models import Employee


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'date', 'description', 'image', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class PromotionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    employee_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'id',
            'employee',
            'employee_name',
            'employee_profile_picture',
            'from_position',
            'to_position',
            'date',
            'created_by',
            'created_by_name',
            'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_employee_profile_picture(self, obj):
        try:
            emp = Employee.objects.get(user=obj.employee)
            if emp.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(emp.profile_picture.url)
                return emp.profile_picture.url
        except Employee.DoesNotExist:
            pass
        return None


class EmployeeOfTheYearSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeOfTheYear
        fields = [
            'id',
            'employee',
            'employee_name',
            'employee_profile_picture',
            'year',
            'reason',
            'created_by',
            'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_employee_profile_picture(self, obj):
        try:
            emp = Employee.objects.get(user=obj.employee)
            if emp.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(emp.profile_picture.url)
                return emp.profile_picture.url
        except Employee.DoesNotExist:
            pass
        return None