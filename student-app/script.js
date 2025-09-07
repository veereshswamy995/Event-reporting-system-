// Student App JavaScript
const API_BASE = window.location.origin + '/api';

let currentEvents = [];
let userRegistrations = [];
let currentUser = {
    name: 'John Doe',
    email: 'john.doe@student.edu',
    phone: '+1234567890'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadUserRegistrations();
    updateProfileDisplay();
    
    // Set up service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
});

// Section Management
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Add active class to clicked nav item
    const clickedButton = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Load data for the section
    if (sectionName === 'events') {
        loadEvents();
    } else if (sectionName === 'my-events') {
        loadUserRegistrations();
    } else if (sectionName === 'checkin') {
        loadCheckinEvents();
    }
}

// Events Management
async function loadEvents() {
    try {
        showLoading('eventsList');
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        currentEvents = events;
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Error loading events: ' + error.message, 'error');
        showEmptyState('eventsList', 'No events available', 'Check back later for upcoming events');
    }
}

function displayEvents(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        showEmptyState('eventsList', 'No events found', 'No events match your current filter');
        return;
    }
    
    eventsList.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEventModal(${event.id})">
            <div class="event-card-header">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-type">${formatEventType(event.type)}</span>
                <div class="event-meta">
                    <div><i class="fas fa-calendar"></i> ${formatDate(event.date)}</div>
                    <div><i class="fas fa-clock"></i> ${formatTime(event.time)}</div>
                    <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                </div>
            </div>
            <div class="event-card-body">
                <p class="event-description">${event.description || 'No description available'}</p>
            </div>
            <div class="event-footer">
                <span class="event-date">${formatDate(event.date)}</span>
                <span class="event-capacity">Max: ${event.max_participants}</span>
            </div>
        </div>
    `).join('');
}

function filterEvents() {
    const filterValue = document.getElementById('eventTypeFilter').value;
    const filtered = filterValue ? 
        currentEvents.filter(event => event.type === filterValue) : 
        currentEvents;
    
    displayEvents(filtered);
}

// Event Modal
function openEventModal(eventId) {
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('eventModalTitle');
    const body = document.getElementById('eventModalBody');
    const registerBtn = document.getElementById('registerBtn');
    
    // Store event ID for registration
    modal.dataset.eventId = eventId;
    
    title.textContent = event.title;
    
    // Check if user is already registered
    const isRegistered = userRegistrations.some(reg => reg.event_id === eventId);
    
    body.innerHTML = `
        <div class="event-details">
            <div class="event-meta">
                <div><i class="fas fa-calendar"></i> ${formatDate(event.date)}</div>
                <div><i class="fas fa-clock"></i> ${formatTime(event.time)}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                <div><i class="fas fa-users"></i> Max Participants: ${event.max_participants}</div>
            </div>
            <div class="event-description">
                <h4>Description</h4>
                <p>${event.description || 'No description available'}</p>
            </div>
        </div>
    `;
    
    if (isRegistered) {
        registerBtn.innerHTML = '<i class="fas fa-check"></i> Already Registered';
        registerBtn.disabled = true;
        registerBtn.classList.remove('btn-primary');
        registerBtn.classList.add('btn-secondary');
    } else {
        registerBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Register';
        registerBtn.disabled = false;
        registerBtn.classList.remove('btn-secondary');
        registerBtn.classList.add('btn-primary');
        registerBtn.onclick = () => openRegistrationModal(eventId);
    }
    
    modal.style.display = 'block';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Registration Modal
// Add missing registerForEvent function
function registerForEvent() {
    const eventId = document.getElementById('eventModal').dataset.eventId;
    if (eventId) {
        openRegistrationModal(eventId);
    }
}

// Add missing openRegistrationModal function
function openRegistrationModal(eventId) {
    closeEventModal();
    document.getElementById('registrationModal').style.display = 'block';
    
    // Pre-fill email if available
    document.getElementById('studentEmailReg').value = currentUser.email;
    
    // Store current event ID
    document.getElementById('registrationForm').dataset.eventId = eventId;
}

// Add missing closeRegistrationModal function
function closeRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('registrationForm').reset();
}

// Add missing showProfile function
function showProfile() {
    document.getElementById('profileModal').style.display = 'block';
}

// Add missing closeProfileModal function
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Add missing editProfile function
function editProfile() {
    const newName = prompt('Enter your name:', currentUser.name);
    if (newName && newName.trim()) {
        currentUser.name = newName.trim();
    }
    
    const newPhone = prompt('Enter your phone number:', currentUser.phone);
    if (newPhone && newPhone.trim()) {
        currentUser.phone = newPhone.trim();
    }
    
    updateProfileDisplay();
    showToast('Profile updated successfully!', 'success');
}

async function submitRegistration(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('registrationForm').dataset.eventId;
    const formData = {
        event_id: parseInt(eventId),
        student_name: document.getElementById('studentName').value.trim(),
        student_email: document.getElementById('studentEmailReg').value.trim(),
        student_phone: document.getElementById('studentPhone').value.trim()
    };
    
    // Basic validation
    if (!formData.student_name || !formData.student_email) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Registration successful!', 'success');
            closeRegistrationModal();
            loadUserRegistrations();
            loadEvents(); // Refresh events to update registration status
        } else {
            const error = await response.json();
            showToast(error.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error registering:', error);
        showToast('Registration failed. Please check your connection.', 'error');
    }
}

// My Events
async function loadUserRegistrations() {
    try {
        showLoading('myEventsList');
        
        // Get all registrations for the current user
        const userRegs = userRegistrations.filter(reg => reg.student_email === currentUser.email);
        
        if (userRegs.length === 0) {
            showEmptyState('myEventsList', 'No registrations', 'You haven\'t registered for any events yet');
            return;
        }
        
        displayUserRegistrations(userRegs);
    } catch (error) {
        console.error('Error loading user registrations:', error);
        showToast('Error loading your events', 'error');
    }
}

function displayUserRegistrations(registrations) {
    const myEventsList = document.getElementById('myEventsList');
    
    myEventsList.innerHTML = registrations.map(reg => {
        const event = currentEvents.find(e => e.id === reg.event_id);
        if (!event) return '';
        
        return `
            <div class="registration-card">
                <div class="registration-header">
                    <h3 class="registration-title">${event.title}</h3>
                    <span class="status-badge status-${reg.status}">${formatStatus(reg.status)}</span>
                </div>
                <div class="registration-meta">
                    <div><i class="fas fa-calendar"></i> ${formatDate(event.date)}</div>
                    <div><i class="fas fa-clock"></i> ${formatTime(event.time)}</div>
                    <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                </div>
                <div class="registration-info">
                    <p><strong>Registration Date:</strong> ${formatDateTime(reg.created_at)}</p>
                    ${reg.check_in_time ? 
                        `<p><strong>Check-in Time:</strong> ${formatDateTime(reg.check_in_time)}</p>` : 
                        '<p class="text-muted">Not checked in yet</p>'
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Check-in
async function loadCheckinEvents() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        const events = await response.json();
        
        const select = document.getElementById('checkinEventSelect');
        select.innerHTML = '<option value="">Choose an event...</option>' + 
            events.map(event => 
                `<option value="${event.id}">${event.title} - ${formatDate(event.date)}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading events for check-in:', error);
        showToast('Error loading events', 'error');
    }
}

async function performCheckin(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('checkinEventSelect').value;
    const email = document.getElementById('studentEmail').value;
    
    try {
        const response = await fetch(`${API_BASE}/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_id: parseInt(eventId),
                student_email: email
            })
        });
        
        const checkinStatus = document.getElementById('checkinStatus');
        
        if (response.ok) {
            checkinStatus.innerHTML = `
                <div class="status-success">
                    <i class="fas fa-check-circle"></i>
                    <h3>Check-in Successful!</h3>
                    <p>You have been successfully checked in to the event.</p>
                </div>
            `;
            showToast('Check-in successful!', 'success');
            loadUserRegistrations(); // Refresh user registrations
        } else {
            const error = await response.json();
            checkinStatus.innerHTML = `
                <div class="status-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Check-in Failed</h3>
                    <p>${error.error || 'Unable to check in. Please try again.'}</p>
                </div>
            `;
            showToast(error.error || 'Check-in failed', 'error');
        }
        
        checkinStatus.style.display = 'block';
        
        // Hide status after 5 seconds
        setTimeout(() => {
            checkinStatus.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error checking in:', error);
        showToast('Check-in failed', 'error');
    }
}

// Profile Management
function showProfile() {
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function updateProfileDisplay() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    
    // Update stats
    const userRegs = userRegistrations.filter(reg => reg.student_email === currentUser.email);
    document.getElementById('totalRegistrations').textContent = userRegs.length;
    document.getElementById('totalAttended').textContent = userRegs.filter(reg => reg.status === 'checked_in').length;
}

function editProfile() {
    const newName = prompt('Enter your name:', currentUser.name);
    if (newName && newName.trim()) {
        currentUser.name = newName.trim();
    }
    
    const newPhone = prompt('Enter your phone number:', currentUser.phone);
    if (newPhone && newPhone.trim()) {
        currentUser.phone = newPhone.trim();
    }
    
    updateProfileDisplay();
    showToast('Profile updated successfully!', 'success');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatEventType(type) {
    const types = {
        'hackathon': 'Hackathon',
        'workshop': 'Workshop',
        'tech_talk': 'Tech Talk',
        'fest': 'Festival'
    };
    return types[type] || type;
}

function formatStatus(status) {
    const statuses = {
        'registered': 'Registered',
        'checked_in': 'Checked In',
        'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
}

// UI Helper Functions
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Loading...</p>
        </div>
    `;
}

function showEmptyState(containerId, title, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Mock data for development (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add some mock registrations for testing
    userRegistrations = [
        {
            id: 1,
            event_id: 1,
            student_name: 'John Doe',
            student_email: 'john.doe@student.edu',
            student_phone: '+1234567890',
            status: 'registered',
            created_at: '2024-01-15T10:00:00Z'
        }
    ];
}
