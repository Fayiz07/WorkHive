from django.contrib import admin
from .models import Attendance

# Register your models here.


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'check_in_time', 'check_out_time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('employee__username',)

