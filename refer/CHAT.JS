document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('log_in');
    const signupForm = document.querySelector('.signup_form');
    const navToSignup = document.getElementById('nav-to-signup');
    const navToLogin = document.getElementById('nav-to-login');
    const closeLogin = document.getElementById('closelog');

    // Event listeners for navigation
    navToSignup.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    navToLogin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    closeLogin.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
    });

    // Add more JavaScript functionalities as needed, e.g., Firebase auth
});
