from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'department', 'job_title', 'salary', 'date_of_joining')
    search_fields = ('employee_id', 'user__username', 'user__email', 'department')
    list_filter = ('department', 'job_title')
    readonly_fields = ('user',)
    
    fieldsets = (
        ('Employee Information', {
            'fields': ('user', 'employee_id', 'department', 'job_title')
        }),
        ('Employment Details', {
            'fields': ('date_of_joining', 'salary', 'profile_picture')
        }),
    )