document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authToggle = document.getElementById('auth-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    
    // Current User
    let currentUser = null;
    
    // Initialize auth system
    function initAuth() {
        // Check for logged in user
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        }
        
        // Event Listeners
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        if (authToggle) {
            authToggle.addEventListener('click', toggleAuthModal);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
    
    // Handle Login
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // In a real app, you would call your backend API here
            // This is a mock implementation
            const user = await mockLogin(email, password);
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            hideAuthModal();
            
            // Show success message
            showAlert('Login successful!', 'success');
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // Handle Registration
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }
        
        try {
            // In a real app, you would call your backend API here
            // This is a mock implementation
            const user = await mockRegister(username, email, password);
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            hideAuthModal();
            
            // Show success message
            showAlert('Registration successful!', 'success');
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // Handle Logout
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showAlert('Logged out successfully', 'success');
    }
    
    // Toggle Auth Modal
    function toggleAuthModal() {
        if (authModal.style.display === 'block') {
            hideAuthModal();
        } else {
            showAuthModal();
        }
    }
    
    function showAuthModal() {
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function hideAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
        // Reset forms
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
    }
    
    // Update UI based on auth state
    function updateAuthUI() {
        if (currentUser) {
            // User is logged in
            if (authToggle) authToggle.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
            
            // Enable user-specific features
            enablePremiumFeatures();
            
        } else {
            // User is logged out
            if (authToggle) authToggle.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
            
            // Disable user-specific features
            disablePremiumFeatures();
        }
    }
    
    // Enable premium features for logged in users
    function enablePremiumFeatures() {
        // Example: Enable playlist saving
        const savePlaylistBtn = document.getElementById('save-playlist-btn');
        if (savePlaylistBtn) savePlaylistBtn.disabled = false;
        
        // Example: Show premium content
        const premiumElements = document.querySelectorAll('.premium');
        premiumElements.forEach(el => el.style.display = 'block');
    }
    
    // Disable premium features
    function disablePremiumFeatures() {
        // Example: Disable playlist saving
        const savePlaylistBtn = document.getElementById('save-playlist-btn');
        if (savePlaylistBtn) savePlaylistBtn.disabled = true;
        
        // Example: Hide premium content
        const premiumElements = document.querySelectorAll('.premium');
        premiumElements.forEach(el => el.style.display = 'none');
    }
    
    // Show alert messages
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.auth-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `auth-alert ${type}`;
        alertDiv.textContent = message;
        
        // Add to auth modal or main page
        const container = authModal || document.body;
        container.prepend(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    // Mock authentication functions (replace with real API calls)
    async function mockLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock users database
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 500); // Simulate network delay
        });
    }
    
    async function mockRegister(username, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validate inputs
                if (!username || !email || !password) {
                    reject(new Error('All fields are required'));
                    return;
                }
                
                // Check if user exists
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userExists = users.some(u => u.email === email);
                
                if (userExists) {
                    reject(new Error('Email already registered'));
                } else {
                    // Create new user
                    const newUser = {
                        id: Date.now().toString(),
                        username,
                        email,
                        password, // In real app, password should be hashed
                        createdAt: new Date().toISOString()
                    };
                    
                    // Save to mock "database"
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    resolve(newUser);
                }
            }, 500); // Simulate network delay
        });
    }
    
    // Initialize auth system
    initAuth();
    
    // Export functions needed by main player
    window.auth = {
        getCurrentUser: () => currentUser,
        showAuthModal,
        hideAuthModal
    };
    // Close modal when clicking X
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('login-modal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('login-modal')) {
        document.getElementById('login-modal').style.display = 'none';
    }
});
});