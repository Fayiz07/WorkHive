from django.db import models
from django.conf import settings

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),      
        ('approved', 'Approved'),    
        ('rejected', 'Rejected'),    
        ('present', 'Present'),      
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
    )
    
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    
    date = models.DateField(auto_now_add=True)
    check_in_time = models.TimeField()
    check_out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # New fields for request system
    notes = models.TextField(blank=True, null=True)  
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_attendances'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['employee', 'date']
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date} - {self.status}"