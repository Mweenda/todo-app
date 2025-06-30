from rest_framework import serializers
from .models import Todo

class TodoSerializer(serializers.ModelSerializer):
    """
    Serializer for the Todo model. Converts Todo instances to JSON and back.
    """
    class Meta:
        model = Todo
        fields = ['id', 'title', 'completed', 'created_at']