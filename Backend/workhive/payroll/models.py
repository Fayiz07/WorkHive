from django.db import models
from django.conf import settings

class Payroll(models.Model):
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payrolls'
    )
    month = models.CharField(max_length=20)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    paid_on = models.DateField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)

    class Meta:
        ordering = ['-month']

    def __str__(self):
        return f"{self.employee.get_full_name() or self.employee.username} - {self.month}"