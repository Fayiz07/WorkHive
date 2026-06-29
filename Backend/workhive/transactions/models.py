from django.db import models
from django.conf import settings

# Create your models here.


class Transaction(models.Model):
    TRANSACTION_TYPE = (
        ('salary', 'Salary'),
        ('bonus', 'Bonus'),
        ('deduction', 'Deduction'),
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    description = models.TextField()
    reference_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.transaction_type} - ₹{self.amount}"
