from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Todo
from .serializers import TodoSerializer

class TodoViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows todos to be viewed or edited.
    Provides list, create, retrieve, update, and destroy actions.
    """
    queryset = Todo.objects.all()
    serializer_class = TodoSerializer

    @action(detail=False, methods=['post'])
    def clear_completed(self, request):
        """
        Custom action to delete all completed to-do items.
        """
        completed_todos = Todo.objects.filter(completed=True)
        count = completed_todos.count()
        completed_todos.delete()
        return Response({'message': f'{count} completed tasks were cleared successfully.'}, status=status.HTTP_204_NO_CONTENT)

