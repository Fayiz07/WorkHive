from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'employee', 'employee_name', 'transaction_type', 'amount', 'date', 'description', 'reference_id']