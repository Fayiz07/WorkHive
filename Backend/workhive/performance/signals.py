from django.db.models.signals import post_save
from django.dispatch import receiver
from employees.models import Employee
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Employee)
def create_performance_for_employee(sender, instance, created, **kwargs):
    if created:
        from performance.models import Performance
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            Performance.objects.create(
                employee=instance.user,
                reviewer=admin_user,
                rating=3,
                feedback='New employee - review pending',
                goals='To be determined'
            )