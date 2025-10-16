// CivicChain Main Application JavaScript

// Global state management
const AppState = {
    currentUser: null,
    authToken: null,
    currentSection: 'home',
    wallet: {
        connected: false,
        address: null,
        balance: 0
    }
};

// API Configuration
const API_BASE_URL = '/api';
const ENDPOINTS = {
    AUTH: {
        SIGNIN: `${API_BASE_URL}/auth/signin`,
        SIGNUP: `${API_BASE_URL}/auth/signup`,
        REFRESH: `${API_BASE_URL}/auth/refresh`
    },
    ISSUES: `${API_BASE_URL}/issues`,
    USERS: `${API_BASE_URL}/users`,
    ADMIN: `${API_BASE_URL}/admin`
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadDashboardStats();
});

// Application initialization
function initializeApp() {
    console.log('CivicChain application starting...');
    
    // Check for saved auth token
    const token = localStorage.getItem('civicchain_token');
    if (token) {
        AppState.authToken = token;
        validateToken(token);
    }
    
    // Initialize tooltips and other Bootstrap components
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Set initial section
    showSection('home');
}

// Event listeners setup
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            showSection(target);
        });
    });
    
    // Authentication forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleAuth = document.getElementById('toggleAuth');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (toggleAuth) {
        toggleAuth.addEventListener('click', toggleAuthForm);
    }
    
    // Issue reporting form
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleIssueSubmit);
    }
    
    // Location button
    const getLocationBtn = document.getElementById('getLocation');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    // Media upload handlers
    setupMediaUploadHandlers();
    
    // Filter handlers
    setupFilterHandlers();
    
    // Logout handler
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        AppState.currentSection = sectionName;
        
        // Load section-specific data
        switch(sectionName) {
            case 'issues':
                loadIssues();
                break;
            case 'leaderboard':
                loadLeaderboard();
                break;
            case 'report':
                if (!AppState.currentUser) {
                    showAuthModal();
                    return;
                }
                break;
        }
    }
    
    // Update URL without page reload
    if (history.pushState) {
        history.pushState(null, null, `#${sectionName}`);
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const usernameField = document.getElementById('loginUsername');
    const passwordField = document.getElementById('loginPassword');
    const username = usernameField.value.trim();
    const password = passwordField.value;
    
    // Clear previous validation states
    clearValidation([usernameField, passwordField]);
    
    // Validate form
    const validationErrors = [];
    
    if (!username) {
        setFieldError(usernameField, 'Username is required');
        validationErrors.push('username');
    } else if (username.length < 3) {
        setFieldError(usernameField, 'Username must be at least 3 characters');
        validationErrors.push('username');
    } else {
        setFieldValid(usernameField);
    }
    
    if (!password) {
        setFieldError(passwordField, 'Password is required');
        validationErrors.push('password');
    } else if (password.length < 6) {
        setFieldError(passwordField, 'Password must be at least 6 characters');
        validationErrors.push('password');
    } else {
        setFieldValid(passwordField);
    }
    
    if (validationErrors.length > 0) {
        showNotification('Please correct the highlighted fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        console.log('Attempting login with:', { username, password: '[HIDDEN]' });
        const requestBody = { username, password };
        console.log('Request body:', requestBody);
        
        const response = await fetch(ENDPOINTS.AUTH.SIGNIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            
            // Store token and user data
            AppState.authToken = data.token;
            AppState.currentUser = {
                id: data.id,
                username: data.username,
                email: data.email,
                roles: data.roles || ['ROLE_USER'],
                points: data.points || 0,
                level: data.level || 1,
                tokenBalance: data.tokenBalance || 0.0,
                walletAddress: data.walletAddress
            };
            
            localStorage.setItem('civicchain_token', data.token);
            localStorage.setItem('civicchain_user', JSON.stringify(AppState.currentUser));
            
            // Update UI
            updateUserInterface();
            hideAuthModal();
            
            // Clear form
            document.getElementById('loginForm').reset();
            clearValidation([usernameField, passwordField]);
            
            showNotification(`Welcome back, ${AppState.currentUser.username}!`, 'success');
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Invalid username or password';
            
            if (response.status === 401) {
                setFieldError(passwordField, 'Invalid credentials');
                setFieldError(usernameField, 'Invalid credentials');
            }
            
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showNotification('Unable to connect to server. Please try again.', 'error');
        } else {
            showNotification('Login failed. Please try again.', 'error');
        }
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        fullName: document.getElementById('regFullName').value,
        phoneNumber: document.getElementById('regPhoneNumber').value,
        city: document.getElementById('regCity').value,
        state: document.getElementById('regState').value,
        role: document.getElementById('regRole').value
    };
    
    // Add geolocation if available
    if (navigator.geolocation) {
        try {
            const position = await getCurrentPositionAsync();
            formData.latitude = position.coords.latitude;
            formData.longitude = position.coords.longitude;
        } catch (error) {
            console.log('Geolocation not available:', error);
        }
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(ENDPOINTS.AUTH.SIGNUP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            toggleAuthForm(); // Switch to login form
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    AppState.currentUser = null;
    AppState.authToken = null;
    localStorage.removeItem('civicchain_token');
    localStorage.removeItem('civicchain_user');
    
    updateUserInterface();
    showSection('home');
    showNotification('Logged out successfully', 'info');
}

// Issue reporting functions
async function handleIssueSubmit(e) {
    e.preventDefault();
    
    if (!AppState.currentUser) {
        showAuthModal();
        return;
    }
    
    const formData = new FormData();
    
    // Basic issue data
    formData.append('title', document.getElementById('issueTitle').value);
    formData.append('description', document.getElementById('issueDescription').value);
    formData.append('type', document.getElementById('issueType').value);
    formData.append('priority', document.getElementById('issuePriority').value);
    formData.append('severity', document.getElementById('issueSeverity').value);
    formData.append('latitude', document.getElementById('issueLatitude').value);
    formData.append('longitude', document.getElementById('issueLongitude').value);
    formData.append('address', document.getElementById('issueAddress').value);
    
    // Add uploaded files
    const photoFiles = document.getElementById('photoUpload').files;
    const videoFiles = document.getElementById('videoUpload').files;
    
    for (let file of photoFiles) {
        formData.append('photos', file);
    }
    
    for (let file of videoFiles) {
        formData.append('videos', file);
    }
    
    // Add audio if recorded
    if (AppState.recordedAudio) {
        formData.append('audio', AppState.recordedAudio);
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(ENDPOINTS.ISSUES, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Issue reported successfully! You earned 10 points.', 'success');
            document.getElementById('reportForm').reset();
            
            // Update user points
            if (AppState.currentUser) {
                AppState.currentUser.points += 10;
                updateUserInterface();
            }
            
            // Redirect to issues page
            showSection('issues');
        } else {
            showNotification(data.message || 'Failed to submit issue', 'error');
        }
    } catch (error) {
        console.error('Issue submission error:', error);
        showNotification('Failed to submit issue. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Location functions
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    const locationBtn = document.getElementById('getLocation');
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            document.getElementById('issueLatitude').value = latitude;
            document.getElementById('issueLongitude').value = longitude;
            document.getElementById('locationFields').style.display = 'flex';
            
            // Try to get address from coordinates
            reverseGeocode(latitude, longitude);
            
            locationBtn.innerHTML = '<i class="fas fa-check"></i> Location Obtained';
            locationBtn.disabled = false;
            
            showNotification('Location obtained successfully!', 'success');
        },
        function(error) {
            console.error('Geolocation error:', error);
            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Current Location';
            locationBtn.disabled = false;
            
            let message = 'Unable to get location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
                default:
                    message += 'Unknown error occurred.';
            }
            
            showNotification(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Utility functions
function updateUserInterface() {
    const connectWalletBtn = document.getElementById('connectWallet');
    const userMenu = document.getElementById('userMenu');
    const userPoints = document.getElementById('userPoints');
    const adminPanel = document.getElementById('adminPanel');
    
    if (AppState.currentUser) {
        // Hide connect wallet, show user menu
        if (connectWalletBtn) connectWalletBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Update points display
        if (userPoints) {
            userPoints.textContent = `${AppState.currentUser.points} pts (L${AppState.currentUser.level})`;
        }
        
        // Show admin panel if user is admin
        if (adminPanel && AppState.currentUser.roles.includes('ROLE_ADMIN')) {
            adminPanel.style.display = 'block';
        }
    } else {
        // Show connect wallet, hide user menu
        if (connectWalletBtn) connectWalletBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', function () {
        toast.remove();
    });
}

function showLoading(show) {
    const elements = document.querySelectorAll('.btn[type="submit"]');
    elements.forEach(btn => {
        if (show) {
            btn.classList.add('loading');
            btn.disabled = true;
            if (!btn.dataset.originalText) {
                btn.dataset.originalText = btn.innerHTML;
            }
            btn.innerHTML = '<span class="spinner"></span> Loading...';
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.innerHTML = btn.dataset.originalText;
            }
        }
    });
}

function showAuthModal() {
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();
}

function hideAuthModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    if (modal) {
        modal.hide();
    }
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');
    const toggleLink = document.getElementById('toggleAuth');
    
    if (loginForm.style.display !== 'none') {
        // Switch to register
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        modalTitle.textContent = 'Register';
        toggleLink.textContent = 'Already have an account? Login';
    } else {
        // Switch to login
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        modalTitle.textContent = 'Login';
        toggleLink.textContent = "Don't have an account? Register";
    }
}

// Data loading functions
async function loadDashboardStats() {
    try {
        // This would normally fetch from API
        // For demo, using placeholder values
        document.getElementById('totalIssues').textContent = '1,234';
        document.getElementById('resolvedIssues').textContent = '892';
        document.getElementById('totalUsers').textContent = '5,678';
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadIssues() {
    // This function is now specific to the dashboard page
    // The issues page has its own implementation
    try {
        const container = document.getElementById('issuesContainer');
        if (!container) {
            // Not on issues page
            return;
        }
        
        showLoading(true);
        
        const response = await fetch('/api/issues', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const issues = data.issues || [];
            
            if (issues.length === 0) {
                container.innerHTML = `<div class="text-center py-8">
                    <p class="text-gray-500">No issues found. Be the first to report one!</p>
                </div>`;
            } else {
                // For dashboard preview, show first few issues
                const preview = issues.slice(0, 3);
                container.innerHTML = preview.map(issue => `
                    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <h4 class="font-semibold text-gray-900 mb-2">${escapeHtmlDashboard(issue.title)}</h4>
                        <p class="text-gray-600 text-sm mb-2">${escapeHtmlDashboard(issue.description.substring(0, 100))}...</p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span><i class="fas fa-map-marker-alt mr-1"></i>${escapeHtmlDashboard(issue.address || 'Unknown location')}</span>
                            <span>${getTimeAgo(new Date(issue.createdAt))}</span>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            throw new Error('Failed to load issues');
        }
    } catch (error) {
        console.error('Error loading issues:', error);
        const container = document.getElementById('issuesContainer');
        if (container) {
            container.innerHTML = `<div class="text-center py-8">
                <p class="text-red-500">Failed to load issues. Please try again later.</p>
            </div>`;
        }
    } finally {
        showLoading(false);
    }
}

function escapeHtmlDashboard(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

async function loadLeaderboard() {
    try {
        const tbody = document.querySelector('#leaderboardTable tbody');
        
        // Demo data
        tbody.innerHTML = `
            <tr>
                <td><span class="leaderboard-rank rank-1">1</span></td>
                <td>CivicHero</td>
                <td><span class="level-badge">Level 12</span></td>
                <td><span class="points-badge">1,245 pts</span></td>
                <td>23</td>
                <td>45.2 CIVIC</td>
            </tr>
            <tr>
                <td><span class="leaderboard-rank rank-2">2</span></td>
                <td>CommunityHelper</td>
                <td><span class="level-badge">Level 10</span></td>
                <td><span class="points-badge">987 pts</span></td>
                <td>18</td>
                <td>32.1 CIVIC</td>
            </tr>
            <tr>
                <td><span class="leaderboard-rank rank-3">3</span></td>
                <td>IssueReporter</td>
                <td><span class="level-badge">Level 8</span></td>
                <td><span class="points-badge">756 pts</span></td>
                <td>15</td>
                <td>28.7 CIVIC</td>
            </tr>
        `;
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Media upload functions
function setupMediaUploadHandlers() {
    const photoUpload = document.getElementById('photoUpload');
    const videoUpload = document.getElementById('videoUpload');
    
    if (photoUpload) {
        photoUpload.addEventListener('change', handlePhotoUpload);
    }
    
    if (videoUpload) {
        videoUpload.addEventListener('change', handleVideoUpload);
    }
    
    setupAudioRecording();
}

function handlePhotoUpload(e) {
    const files = e.target.files;
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.margin = '2px';
            preview.appendChild(img);
        }
    }
}

function handleVideoUpload(e) {
    const files = e.target.files;
    const preview = document.getElementById('videoPreview');
    preview.innerHTML = '';
    
    for (let file of files) {
        if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.width = 100;
            video.height = 100;
            video.style.objectFit = 'cover';
            video.style.borderRadius = '8px';
            video.style.margin = '2px';
            video.controls = true;
            preview.appendChild(video);
        }
    }
}

// Audio recording setup
function setupAudioRecording() {
    const startBtn = document.getElementById('startRecording');
    const stopBtn = document.getElementById('stopRecording');
    
    if (!startBtn || !stopBtn) return;
    
    startBtn.addEventListener('click', startAudioRecording);
    stopBtn.addEventListener('click', stopAudioRecording);
}

async function startAudioRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        AppState.mediaRecorder = new MediaRecorder(stream);
        AppState.audioChunks = [];
        
        AppState.mediaRecorder.ondataavailable = function(e) {
            AppState.audioChunks.push(e.data);
        };
        
        AppState.mediaRecorder.onstop = function() {
            const audioBlob = new Blob(AppState.audioChunks, { type: 'audio/wav' });
            AppState.recordedAudio = audioBlob;
            
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = document.createElement('audio');
            audio.src = audioUrl;
            audio.controls = true;
            audio.style.width = '100%';
            
            const preview = document.getElementById('audioPreview');
            preview.innerHTML = '';
            preview.appendChild(audio);
        };
        
        AppState.mediaRecorder.start();
        
        document.getElementById('startRecording').disabled = true;
        document.getElementById('stopRecording').disabled = false;
        
        showNotification('Recording started', 'info');
        
    } catch (error) {
        console.error('Error starting audio recording:', error);
        showNotification('Could not access microphone', 'error');
    }
}

function stopAudioRecording() {
    if (AppState.mediaRecorder && AppState.mediaRecorder.state !== 'inactive') {
        AppState.mediaRecorder.stop();
        
        // Stop all tracks
        AppState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        document.getElementById('startRecording').disabled = false;
        document.getElementById('stopRecording').disabled = true;
        
        showNotification('Recording stopped', 'info');
    }
}

// Filter setup
function setupFilterHandlers() {
    const statusFilter = document.getElementById('filterStatus');
    const typeFilter = document.getElementById('filterType');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    // This would filter the loaded issues
    loadIssues();
}

// Validation and utility functions
function validateToken(token) {
    // This would validate the token with the server
    // For now, just check if user data exists
    const userData = localStorage.getItem('civicchain_user');
    if (userData) {
        AppState.currentUser = JSON.parse(userData);
        updateUserInterface();
    }
}

function checkAuthStatus() {
    const userData = localStorage.getItem('civicchain_user');
    if (userData) {
        AppState.currentUser = JSON.parse(userData);
        updateUserInterface();
    }
}

// Async utility functions
function getCurrentPositionAsync() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function reverseGeocode(lat, lng) {
    try {
        // This would use a real geocoding service
        // For demo, just set a placeholder address
        document.getElementById('issueAddress').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
        console.error('Geocoding error:', error);
    }
}

// Form validation utility functions
function setFieldError(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function setFieldValid(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    // Remove error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearValidation(fields) {
    fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        const successElement = field.parentNode.querySelector('.success-message');
        if (successElement) {
            successElement.remove();
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

