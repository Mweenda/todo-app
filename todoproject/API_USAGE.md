# Todo App API Authentication Guide

Your todo app now has user authentication! Each user can only see and manage their own tasks.

## Authentication Endpoints

### 1. Register a new user
```bash
POST /api/register/
Content-Type: application/json

{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_secure_password",
    "password_confirm": "your_secure_password"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "your_username",
        "email": "your_email@example.com"
    },
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

### 2. Login
```bash
POST /api/login/
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_secure_password"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "your_username",
        "email": "your_email@example.com"
    },
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

### 3. Logout
```bash
POST /api/logout/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response:**
```json
{
    "message": "Successfully logged out"
}
```

## Using the Todo API with Authentication

All todo endpoints now require authentication. Include the token in the Authorization header:

### Create a todo
```bash
POST /api/todos/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json

{
    "title": "My personal task",
    "completed": false
}
```

### Get all todos (user-specific)
```bash
GET /api/todos/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Update a todo
```bash
PUT /api/todos/1/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4b4bbdfc6ee4b
Content-Type: application/json

{
    "title": "Updated task",
    "completed": true
}
```

### Delete a todo
```bash
DELETE /api/todos/1/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Clear completed todos (user-specific)
```bash
POST /api/todos/clear_completed/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

## Security Features

1. **User Isolation**: Each user can only see their own todos
2. **Token Authentication**: Secure token-based authentication
3. **Password Validation**: Django's built-in password validation
4. **Automatic User Assignment**: New todos are automatically assigned to the authenticated user

## Frontend Integration

If you have a frontend, you'll need to:

1. Store the token (e.g., in localStorage or a secure cookie)
2. Include the token in all API requests
3. Handle authentication errors (401) by redirecting to login
4. Implement login/register forms
5. Add a logout button that calls the logout endpoint

## Example using JavaScript fetch:

```javascript
// Login
const response = await fetch('/api/login/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'your_username',
        password: 'your_password'
    })
});

const data = await response.json();
localStorage.setItem('token', data.token);

// Create todo with authentication
const todoResponse = await fetch('/api/todos/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
        title: 'New task',
        completed: false
    })
});
```
