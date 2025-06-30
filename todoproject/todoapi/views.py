from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import render
from .models import Todo
from .serializers import TodoSerializer, UserRegistrationSerializer, UserLoginSerializer

class TodoViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows todos to be viewed or edited.
    Provides list, create, retrieve, update, and destroy actions.
    Only shows todos belonging to the authenticated user.
    """
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter todos to only show those belonging to the authenticated user.
        """
        return Todo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically assign the authenticated user to new todos.
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def clear_completed(self, request):
        """
        Custom action to delete all completed to-do items for the authenticated user.
        """
        completed_todos = Todo.objects.filter(completed=True, user=request.user)
        count = completed_todos.count()
        completed_todos.delete()
        return Response({'message': f'{count} completed tasks were cleared successfully.'}, status=status.HTTP_204_NO_CONTENT)


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'User registered successfully. Please login.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    API endpoint for user login.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'token': token.key
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(generics.GenericAPIView):
    """
    API endpoint for user logout.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Delete the user's token to logout
            request.user.auth_token.delete()
            return Response(
                {'message': 'Successfully logged out'}, 
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {'error': 'Token not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# Template views
def todo_app_view(request):
    """
    Serve the main todo application page.
    This view serves the HTML but authentication is handled by JavaScript.
    """
    return render(request, 'index.html')


def auth_view(request):
    """
    Serve the authentication page.
    """
    return render(request, 'auth.html')

