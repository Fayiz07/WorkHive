from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date
from employees.models import Employee

@receiver(post_save, sender=Employee)
def create_payroll_for_employee(sender, instance, created, **kwargs):
    if created:
        from payroll.models import Payroll
        Payroll.objects.create(
            employee=instance.user,
            month=date.today().strftime('%B %Y'),
            basic_salary=instance.salary,
            deductions=0,
            bonuses=0,
            net_salary=instance.salary,
            is_paid=False
        )