from django.contrib import admin
from .models import Performance

# Register your models here.

@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'reviewer', 'review_date', 'rating')
    list_filter = ('rating', 'review_date')
    search_fields = ('employee__username',)

