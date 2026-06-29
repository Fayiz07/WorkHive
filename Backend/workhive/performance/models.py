from django.db import models
from django.conf import settings

# Create your models here.

class Performance(models.Model):
    RATING_CHOICES = (
        (1, 'Poor'),
        (2, 'Needs Improvement'),
        (3, 'Meets Expectations'),
        (4, 'Exceeds Expectations'),
        (5, 'Outstanding'),
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='performances'
        )


    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviewed_performances'
    )


    review_date = models.DateField(auto_now_add=True)
    rating = models.IntegerField(choices=RATING_CHOICES)
    feedback = models.TextField()
    goals = models.TextField(blank=True)

    class Meta:
        ordering = ['-review_date']

    def __str__(self):
        return f"{self.employee.get_full_name()} - Rating: {self.rating} - {self.review_date}"