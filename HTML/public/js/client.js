document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('signinform');
    const signupForm = document.getElementById('signupform');
    const logoutButton = document.getElementById('logout');
    let inactivityTimer;

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(checkSessionValidity, 2*600000); // 20 minutes
    }

    function checkSessionValidity() {
        fetch('/auth/session-check')
            .then(response => {
                if (!response.ok) {
                    alert('Session expired');
                }
                return response.json();
            })
            .then(data => {
                if (!data.sessionActive) {
                    performLogout();
                }
            })
            .catch(() => {
                performLogout();
            });
    }

    function performLogout() {
        window.location.href = '/login.html';
    }

    // Add event listeners to reset the inactivity timer on user actions
    window.onload = resetInactivityTimer;
    document.onmousemove = resetInactivityTimer;
    document.onkeypress = resetInactivityTimer;

    // Reset the timer initially
    resetInactivityTimer();


    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('signin_email').value;
            const password = document.getElementById('signin_password').value;

            fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => {
                if (!response.ok) {
                    ;
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Login successful') {
                    window.location.href = 'chat.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Login failed: ' + error.message);
            });
        });
    }

    // Handle Signup Form Submission
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;
            const email = document.getElementById('signup_email').value;
            const password = document.getElementById('signup_password').value;

            fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            })
            .then(response => {
                if (!response.ok) {
                    ;
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'User created successfully') {
                    window.location.href = 'login.html';
                    alert('User created successfully');
                } else {
                    alert('Signup failed: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Signup failed: ' + error.message);
            });
        });
    }   
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            e.preventDefault();
    
            // Send a fetch request to the logout endpoint
            fetch('/auth/logout', {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    ;
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Logout successful') {
                    // Redirect to the login page after successful logout
                    window.location.href = data.redirectUrl;
                } else {
                    alert('Logout failed');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Logout failed: ' + error.message);
            });
        });
    }

});