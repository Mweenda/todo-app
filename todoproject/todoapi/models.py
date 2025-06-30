from django.db import models
from django.contrib.auth.models import User

class Todo(models.Model):
    """
    Represents a single to-do item.
    """
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1, null=True, blank=True, related_name='todos')

    def __str__(self):
        """String representation of the Todo model."""
        return self.title

    class Meta:
        ordering = ['-created_at']