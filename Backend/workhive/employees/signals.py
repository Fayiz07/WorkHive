from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from employees.models import Employee

User = get_user_model()

@receiver(post_save, sender=User)
def create_employee_for_user(sender, instance, created, **kwargs):
    if created:
        # If role is admin, make them staff and superuser
        if instance.role == 'admin':
            instance.is_staff = True
            instance.is_superuser = True
            instance.save()
        
        # Create employee record
        Employee.objects.create(
            user=instance,
            employee_id=f'EMP-{instance.id:04d}',
            department='Engineering',
            job_title='Software Developer',
            date_of_joining='2024-01-01',
            salary=50000.00
        )