from django.db import models
from authentication.models import Doctor

class Schedule(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField()
    max_patients = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.doctor.user.get_full_name()} ({self.date} {self.time})"

    class Meta:
        ordering = ['-date', '-time']
