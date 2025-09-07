// Error Handling and Debugging Script
// Add this to both admin-portal and student-app

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Network error. Please check your connection.', 'error');
});

// API error handler
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    if (error.message.includes('Failed to fetch')) {
        return 'Network error. Please check your connection.';
    } else if (error.message.includes('404')) {
        return 'Resource not found.';
    } else if (error.message.includes('500')) {
        return 'Server error. Please try again later.';
    } else if (error.message.includes('400')) {
        return 'Invalid request. Please check your input.';
    }
    
    return defaultMessage;
}

// Connection status checker
function checkConnection() {
    if (!navigator.onLine) {
        showNotification('You are offline. Please check your internet connection.', 'error');
        return false;
    }
    return true;
}

// Add connection status listener
window.addEventListener('online', function() {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are now offline.', 'error');
});

// Debug mode toggle
let debugMode = false;

function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
}

// Enhanced fetch with error handling
async function safeFetch(url, options = {}) {
    if (!checkConnection()) {
        throw new Error('No internet connection');
    }
    
    try {
        const response = await fetch(url, options);
        
        if (debugMode) {
            console.log('Fetch response:', response);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        if (debugMode) {
            console.error('Fetch error:', error);
        }
        throw error;
    }
}
