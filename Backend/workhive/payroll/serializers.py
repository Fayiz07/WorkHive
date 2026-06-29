from rest_framework import serializers
from .models import Payroll

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = ['id', 'employee', 'employee_name', 'month', 'basic_salary', 'deductions',
                  'bonuses', 'net_salary', 'paid_on', 'is_paid']

    def get_employee_name(self, obj):
        full_name = obj.employee.get_full_name()
        return full_name.strip() if full_name.strip() else obj.employee.username