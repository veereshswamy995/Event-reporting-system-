// Admin Portal JavaScript
const API_BASE = window.location.origin + '/api';

let currentEvents = [];
let currentRegistrations = [];
let currentAnalytics = [];
let editingEventId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadRegistrations();
    loadAnalytics();
});

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'events') {
        loadEvents();
    } else if (tabName === 'registrations') {
        loadRegistrations();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Events Management
async function loadEvents() {
    try {
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        currentEvents = events;
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Error loading events: ' + error.message, 'error');
    }
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<div class="loading"><i class="fas fa-calendar"></i><p>No events found</p></div>';
        return;
    }
    
    eventsGrid.innerHTML = events.map(event => `
        <div class="event-card">
            <h3>${event.title}</h3>
            <div class="event-meta">
                <div><i class="fas fa-calendar"></i> ${formatDate(event.date)}</div>
                <div><i class="fas fa-clock"></i> ${formatTime(event.time)}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                <div><i class="fas fa-users"></i> Max: ${event.max_participants}</div>
            </div>
            <span class="event-type">${formatEventType(event.type)}</span>
            <p>${event.description || 'No description available'}</p>
            <div class="event-actions">
                <button class="btn btn-primary" onclick="editEvent(${event.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function openEventModal(eventId = null) {
    editingEventId = eventId;
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('modalTitle');
    
    if (eventId) {
        const event = currentEvents.find(e => e.id == eventId);
        if (!event) {
            showNotification('Event not found', 'error');
            return;
        }
        title.textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventType').value = event.type;
        document.getElementById('maxParticipants').value = event.max_participants;
        document.getElementById('eventImage').value = event.image_url || '';
    } else {
        title.textContent = 'Create New Event';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventId = null;
}

async function saveEvent(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        type: document.getElementById('eventType').value,
        max_participants: parseInt(document.getElementById('maxParticipants').value),
        image_url: document.getElementById('eventImage').value
    };
    
    try {
        const url = editingEventId ? `${API_BASE}/events/${editingEventId}` : `${API_BASE}/events`;
        const method = editingEventId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification(editingEventId ? 'Event updated successfully' : 'Event created successfully', 'success');
            closeEventModal();
            loadEvents();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error saving event', 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Error saving event', 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Event deleted successfully', 'success');
            loadEvents();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error deleting event', 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Error deleting event', 'error');
    }
}

// Registrations Management
async function loadRegistrations() {
    try {
        const response = await fetch(`${API_BASE}/registrations`);
        const registrations = await response.json();
        currentRegistrations = registrations;
        displayRegistrations(registrations);
        populateEventFilter();
    } catch (error) {
        console.error('Error loading registrations:', error);
        showNotification('Error loading registrations', 'error');
    }
}

function displayRegistrations(registrations) {
    const tbody = document.getElementById('registrationsTableBody');
    
    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No registrations found</td></tr>';
        return;
    }
    
    tbody.innerHTML = registrations.map(reg => {
        const event = currentEvents.find(e => e.id === reg.event_id);
        return `
            <tr>
                <td>${event ? event.title : 'Unknown Event'}</td>
                <td>${reg.student_name}</td>
                <td>${reg.student_email}</td>
                <td>${reg.student_phone || 'N/A'}</td>
                <td><span class="status-badge status-${reg.status}">${formatStatus(reg.status)}</span></td>
                <td>${reg.check_in_time ? formatDateTime(reg.check_in_time) : 'Not checked in'}</td>
                <td>
                    ${reg.status === 'registered' ? 
                        `<button class="btn btn-success" onclick="checkinStudent('${reg.student_email}', ${reg.event_id})">
                            <i class="fas fa-check"></i> Check-in
                        </button>` : 
                        '<span class="text-success">Checked in</span>'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function populateEventFilter() {
    const select = document.getElementById('eventFilter');
    const events = currentEvents.map(event => 
        `<option value="${event.id}">${event.title}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">All Events</option>' + events;
}

function filterRegistrations() {
    const eventId = document.getElementById('eventFilter').value;
    const filtered = eventId ? 
        currentRegistrations.filter(reg => reg.event_id === parseInt(eventId)) : 
        currentRegistrations;
    
    displayRegistrations(filtered);
}

async function checkinStudent(email, eventId) {
    try {
        const response = await fetch(`${API_BASE}/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_id: eventId,
                student_email: email
            })
        });
        
        if (response.ok) {
            showNotification('Student checked in successfully', 'success');
            loadRegistrations();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Error checking in student', 'error');
        }
    } catch (error) {
        console.error('Error checking in student:', error);
        showNotification('Error checking in student', 'error');
    }
}

// Analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        const analytics = await response.json();
        currentAnalytics = analytics;
        displayAnalytics(analytics);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

function displayAnalytics(analytics) {
    const analyticsGrid = document.getElementById('analyticsGrid');
    
    if (analytics.length === 0) {
        analyticsGrid.innerHTML = '<div class="loading"><i class="fas fa-chart-bar"></i><p>No analytics data available</p></div>';
        return;
    }
    
    analyticsGrid.innerHTML = analytics.map(stat => `
        <div class="analytics-card">
            <h3>${stat.event_title}</h3>
            <div class="metric">${stat.registered}</div>
            <div class="label">Registered</div>
            <div class="metric">${stat.checked_in}</div>
            <div class="label">Checked In</div>
            <div class="attendance-rate ${getAttendanceClass(stat.attendance_rate)}">
                ${stat.attendance_rate}% Attendance
            </div>
            <div class="label">Capacity: ${stat.max_participants}</div>
        </div>
    `).join('');
}

function getAttendanceClass(rate) {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real application, you would clear authentication tokens
        window.location.href = '/';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
