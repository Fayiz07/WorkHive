from django.contrib import admin
from .models import Transaction

# Register your models here.

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('employee', 'transaction_type', 'amount', 'date', 'description')
    list_filter = ('transaction_type', 'date')
    search_fields = ('employee__username',)


