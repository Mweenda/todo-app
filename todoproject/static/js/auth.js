document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('authToken')) {
        window.location.href = '/api/app/';
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authAlert = document.getElementById('auth-alert');

    // Show alert message
    function showAlert(message, type = 'danger') {
        authAlert.textContent = message;
        authAlert.className = `alert alert-${type} mt-3`;
        authAlert.classList.remove('d-none');
    }

    // Hide alert message
    function hideAlert() {
        authAlert.classList.add('d-none');
    }

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideAlert();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/api/app/';
                }, 1000);
            } else {
                showAlert(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
            console.error('Login error:', error);
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideAlert();

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            showAlert('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    password_confirm: passwordConfirm
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Registration successful! Please login with your credentials.', 'success');
                
                // Switch to login tab
                setTimeout(() => {
                    document.getElementById('login-tab').click();
                    // Clear registration form
                    document.getElementById('register-form').reset();
                }, 1500);
            } else {
                // Handle validation errors
                if (data.username) {
                    showAlert('Username: ' + data.username.join(' '));
                } else if (data.email) {
                    showAlert('Email: ' + data.email.join(' '));
                } else if (data.password) {
                    showAlert('Password: ' + data.password.join(' '));
                } else if (data.non_field_errors) {
                    showAlert(data.non_field_errors.join(' '));
                } else {
                    showAlert('Registration failed. Please try again.');
                }
            }
        } catch (error) {
            showAlert('Network error. Please try again.');
            console.error('Registration error:', error);
        }
    });
});
