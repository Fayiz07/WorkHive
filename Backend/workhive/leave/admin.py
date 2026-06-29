from django.contrib import admin
from .models import Leave

# Register your models here.

@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status', 'applied_on')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__username',)


