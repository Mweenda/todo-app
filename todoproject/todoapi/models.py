from django.db import models

class Todo(models.Model):
    """
    Represents a single to-do item.
    """
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """String representation of the Todo model."""
        return self.title

    class Meta:
        ordering = ['-created_at']