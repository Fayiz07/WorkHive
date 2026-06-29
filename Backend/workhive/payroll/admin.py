from django.contrib import admin
from .models import Payroll

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'basic_salary', 'deductions', 'bonuses', 'is_paid')
    list_filter = ('month', 'is_paid')
    search_fields = ('employee__username',)


