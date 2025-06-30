document.addEventListener('DOMContentLoaded', function() {
    
    // --- AUTHENTICATION CHECK ---
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!authToken) {
        // Redirect to auth page if no token found
        window.location.replace('/auth/');
        return;
    }

    // Display user info
    displayUserInfo(user);
    
    // --- STATE MANAGEMENT ---
    let todos = [];
    let currentFilter = 'all';

    // --- API Configuration ---
    const API_URL = '/api/todos/';

    // --- DOM ELEMENTS ---
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const filterAllBtn = document.getElementById('filter-all');
    const filterActiveBtn = document.getElementById('filter-active');
    const filterCompletedBtn = document.getElementById('filter-completed');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const logoutBtn = document.getElementById('logout-btn');

    // --- AUTHENTICATION HEADERS ---
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
        };
    }

    // --- USER INFO DISPLAY ---
    function displayUserInfo(user) {
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv && user.username) {
            userInfoDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0">Welcome, ${user.username}!</h5>
                        <small>${user.email}</small>
                    </div>
                    <button id="logout-btn" class="btn logout-btn btn-sm">Logout</button>
                </div>
            `;
            
            // Add logout functionality
            document.getElementById('logout-btn').addEventListener('click', logout);
        }
    }

    // --- LOGOUT FUNCTION ---
    async function logout() {
        try {
            await fetch('/api/logout/', {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/';
        }
    }

    // --- CSRF TOKEN HELPER ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // --- API FUNCTIONS ---
    const fetchTodos = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/';
                return;
            }
            
            if (!response.ok) throw new Error('Network response was not ok');
            todos = await response.json();
            renderTodos();
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            showMessage('Error fetching tasks. Please refresh.', 'danger');
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        const title = todoInput.value.trim();
        if (title) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({ title: title, completed: false })
                });
                
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/';
                    return;
                }
                
                if (!response.ok) throw new Error('Failed to add task');
                const newTodo = await response.json();
                todos.push(newTodo);
                sortAndRenderTodos();
                todoInput.value = '';
            } catch (error) {
                console.error('Error adding task:', error);
                showMessage('Failed to add task.', 'danger');
            }
        }
    };

    const toggleComplete = async (id, currentTodo) => {
        try {
            const response = await fetch(`${API_URL}${id}/`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({ ...currentTodo, completed: !currentTodo.completed })
            });
            
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/';
                return;
            }
            
            if (!response.ok) throw new Error('Failed to update task');
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
            }
            renderTodos();
        } catch (error) {
            console.error('Error updating task:', error);
            showMessage('Failed to update task.', 'danger');
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}${id}/`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                    'X-CSRFToken': csrftoken
                }
            });
            
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/';
                return;
            }
            
            if (!response.ok) throw new Error('Failed to delete task');
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } catch (error) {
            console.error('Error deleting task:', error);
            showMessage('Failed to delete task.', 'danger');
        }
    };

    const clearCompletedTasks = async () => {
        try {
            const response = await fetch(`${API_URL}clear_completed/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'X-CSRFToken': csrftoken
                }
            });
            
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/';
                return;
            }
            
            if (!response.ok) throw new Error('Failed to clear completed tasks');
            await fetchTodos(); // Refetch all todos
            showMessage('Cleared all completed tasks.', 'success');
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            showMessage('Failed to clear completed tasks.', 'danger');
        }
    };
    
    // --- UI RENDERING ---
    function sortAndRenderTodos() {
        todos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderTodos();
    }

    function renderTodos() {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true; // 'all'
        });

        if (filteredTodos.length === 0 && todos.length > 0) {
            todoList.innerHTML = `<li class="list-group-item text-center text-muted">No tasks for this filter.</li>`;
        } else if (todos.length === 0) {
            todoList.innerHTML = `<li class="list-group-item text-center text-muted">Your to-do list is empty!</li>`;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `list-group-item d-flex justify-content-between align-items-center ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            const taskText = document.createElement('span');
            taskText.textContent = todo.title;
            taskText.style.cursor = 'pointer';
            taskText.onclick = () => toggleComplete(todo.id, todo);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = () => deleteTask(todo.id);

            li.appendChild(taskText);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
        updateFilterButtons();
    }

    // --- FILTERS ---
    function setFilter(filter) {
        currentFilter = filter;
        renderTodos();
    }

    function updateFilterButtons() {
        filterAllBtn.classList.toggle('active', currentFilter === 'all');
        filterActiveBtn.classList.toggle('active', currentFilter === 'active');
        filterCompletedBtn.classList.toggle('active', currentFilter === 'completed');
    }

    // --- UTILITY ---
    function showMessage(message, type = 'info') {
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = message;
        messageBox.className = `alert alert-${type} mt-3`;
        messageBox.classList.remove('d-none');
        setTimeout(() => {
            messageBox.classList.add('d-none');
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    todoForm.addEventListener('submit', addTask);
    filterAllBtn.addEventListener('click', () => setFilter('all'));
    filterActiveBtn.addEventListener('click', () => setFilter('active'));
    filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // --- INITIAL LOAD ---
    fetchTodos();
});
