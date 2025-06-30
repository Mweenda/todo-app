from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, RegisterView, LoginView, LogoutView, todo_app_view, auth_view

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Template views
    path('app/', todo_app_view, name='todo-app'),
    path('auth/', auth_view, name='auth'),
]
