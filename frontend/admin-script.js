// Admin JavaScript for API integration

// API Configuration for Render
const API_BASE_URL = 'https://malumbo-academy-api.onrender.com/api';

// Global state
let authToken = localStorage.getItem('adminToken');
let currentUser = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        // Verify token is still valid
        verifyToken();
    } else {
        showLoginScreen();
    }
    
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Admin tab navigation
    document.querySelectorAll('.admin-sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active tab in sidebar
            document.querySelectorAll('.admin-sidebar a').forEach(a => {
                a.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show selected tab
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.style.display = 'none';
            });
            document.getElementById(tabId).style.display = 'block';
            
            // Load data for the tab
            switch(tabId) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'manage-slides':
                    loadAdminSlides();
                    break;
                case 'manage-events':
                    loadAdminEvents();
                    break;
                case 'manage-gallery':
                    loadAdminGallery();
                    break;
                case 'manage-messages':
                    loadAdminMessages();
                    break;
            }
        });
    });
    
    // Add slide form
    const addSlideForm = document.getElementById('addSlideForm');
    if (addSlideForm) {
        addSlideForm.addEventListener('submit', handleAddSlide);
    }
    
    // Add event form
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', handleAddEvent);
    }
    
    // Add gallery form
    const addGalleryForm = document.getElementById('addGalleryForm');
    if (addGalleryForm) {
        addGalleryForm.addEventListener('submit', handleAddGallery);
    }
    
    // Settings form
    const settingsForm = document.getElementById('adminSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSaveSettings);
    }
}

// Verify token validity
async function verifyToken() {
    try {
        // Try to load dashboard stats to verify token
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showAdminPanel();
            loadDashboardStats();
        } else {
            localStorage.removeItem('adminToken');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('adminToken');
        showLoginScreen();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginMessage = document.getElementById('loginMessage');
    
    // Show loading state
    loginText.style.display = 'none';
    loginSpinner.style.display = 'inline-block';
    loginMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Save token and user data
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('adminToken', authToken);
        
        // Show admin panel
        showAdminPanel();
        loadDashboardStats();
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Show error message
        loginMessage.textContent = error.message || 'Login failed. Please try again.';
        loginMessage.className = 'form-message error';
        loginMessage.style.display = 'block';
        
    } finally {
        // Restore button state
        loginText.style.display = 'inline';
        loginSpinner.style.display = 'none';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    currentUser = null;
    showLoginScreen();
}

// Show login screen
function showLoginScreen() {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
    
    // Reset login form
    if (loginForm) {
        loginForm.reset();
    }
}

// Show admin panel
function showAdminPanel() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        showLoading('statsGrid', 'Loading statistics...');
        
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const data = await response.json();
        renderDashboardStats(data.data);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        renderError('statsGrid', 'Failed to load statistics');
    }
}

// Render dashboard statistics
function renderDashboardStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <i class="fas fa-images" style="font-size: 2rem; color: var(--primary);"></i>
            <div class="stat-number">${stats.slides}</div>
            <div class="stat-label">Active Slides</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-calendar-alt" style="font-size: 2rem; color: var(--accent);"></i>
            <div class="stat-number">${stats.events}</div>
            <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-camera" style="font-size: 2rem; color: var(--secondary);"></i>
            <div class="stat-number">${stats.gallery}</div>
            <div class="stat-label">Gallery Images</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-envelope" style="font-size: 2rem; color: #e74c3c;"></i>
            <div class="stat-number">${stats.unreadMessages}</div>
            <div class="stat-label">Unread Messages</div>
        </div>
    `;
}

// Load admin slides
async function loadAdminSlides() {
    try {
        showLoading('slidesList', 'Loading slides...');
        
        const response = await fetch(`${API_BASE_URL}/admin/slides`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load slides');
        }
        
        const slides = await response.json();
        renderAdminSlides(slides);
    } catch (error) {
        console.error('Error loading admin slides:', error);
        renderError('slidesList', 'Failed to load slides');
    }
}

// Render admin slides
function renderAdminSlides(slides) {
    const slidesList = document.getElementById('slidesList');
    
    if (slides.length === 0) {
        slidesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>No Slides Yet</h3>
                <p>Add your first slide using the form above</p>
            </div>
        `;
        return;
    }
    
    let html = '<table class="admin-table">';
    html += `
        <thead>
            <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    slides.forEach(slide => {
        const shortDescription = slide.description ? 
            (slide.description.length > 50 ? slide.description.substring(0, 50) + '...' : slide.description) : 
            'N/A';
        const statusHtml = slide.is_active ? 
            '<span style="color: green;">Active</span>' : 
            '<span style="color: red;">Inactive</span>';
        
        html += `
            <tr>
                <td><img src="${slide.image_url}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;" alt="Preview"></td>
                <td>${slide.title}</td>
                <td>${shortDescription}</td>
                <td>${slide.display_order}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editSlide(${slide.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteSlide(${slide.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    slidesList.innerHTML = html;
}

// Handle add slide
async function handleAddSlide(e) {
    e.preventDefault();
    
    const imageUrl = document.getElementById('slideImageUrl').value;
    const title = document.getElementById('slideTitle').value;
    const description = document.getElementById('slideDescription').value;
    const order = document.getElementById('slideOrder').value;
    const isActive = document.getElementById('slideActive').checked;
    
    const addSlideText = document.getElementById('addSlideText');
    const addSlideSpinner = document.getElementById('addSlideSpinner');
    
    // Show loading state
    addSlideText.style.display = 'none';
    addSlideSpinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                title: title,
                description: description,
                display_order: parseInt(order) || 0,
                is_active: isActive
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add slide');
        }
        
        // Reset form
        e.target.reset();
        
        // Reload slides list
        loadAdminSlides();
        
        // Show success message
        showNotification('Slide added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding slide:', error);
        showNotification('Failed to add slide: ' + error.message, 'error');
    } finally {
        // Restore button state
        addSlideText.style.display = 'inline';
        addSlideSpinner.style.display = 'none';
    }
}

// Delete slide
async function deleteSlide(id) {
    if (!confirm('Are you sure you want to delete this slide?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete slide');
        }
        
        // Reload slides list
        loadAdminSlides();
        
        // Show success message
        showNotification('Slide deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting slide:', error);
        showNotification('Failed to delete slide: ' + error.message, 'error');
    }
}

// Edit slide function (called from HTML onclick)
async function editSlide(id) {
    alert('Edit functionality would be implemented here. For now, delete and recreate the slide.');
}

// Load admin events
async function loadAdminEvents() {
    try {
        showLoading('eventsList', 'Loading events...');
        
        const response = await fetch(`${API_BASE_URL}/admin/events`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load events');
        }
        
        const events = await response.json();
        renderAdminEvents(events);
    } catch (error) {
        console.error('Error loading admin events:', error);
        renderError('eventsList', 'Failed to load events');
    }
}

// Render admin events
function renderAdminEvents(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Events Yet</h3>
                <p>Add your first event using the form above</p>
            </div>
        `;
        return;
    }
    
    let html = '<table class="admin-table">';
    html += `
        <thead>
            <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    events.forEach(event => {
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const statusHtml = event.is_published ? 
            '<span style="color: green;">Published</span>' : 
            '<span style="color: red;">Draft</span>';
        
        html += `
            <tr>
                <td>${formattedDate}</td>
                <td>${event.title}</td>
                <td>${event.location || 'N/A'}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editEvent(${event.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    eventsList.innerHTML = html;
}

// Handle add event
async function handleAddEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const published = document.getElementById('eventPublished').checked;
    
    const addEventText = document.getElementById('addEventText');
    const addEventSpinner = document.getElementById('addEventSpinner');
    
    // Show loading state
    addEventText.style.display = 'none';
    addEventSpinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                event_date: date,
                description: description,
                event_time: time,
                location: location,
                is_published: published
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add event');
        }
        
        // Reset form
        e.target.reset();
        
        // Reload events list
        loadAdminEvents();
        
        // Show success message
        showNotification('Event added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding event:', error);
        showNotification('Failed to add event: ' + error.message, 'error');
    } finally {
        // Restore button state
        addEventText.style.display = 'inline';
        addEventSpinner.style.display = 'none';
    }
}

// Delete event
async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        
        // Reload events list
        loadAdminEvents();
        
        // Show success message
        showNotification('Event deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Failed to delete event: ' + error.message, 'error');
    }
}

// Edit event function (called from HTML onclick)
async function editEvent(id) {
    alert('Edit functionality would be implemented here. For now, delete and recreate the event.');
}

// Load admin gallery
async function loadAdminGallery() {
    try {
        showLoading('galleryList', 'Loading gallery...');
        
        const response = await fetch(`${API_BASE_URL}/admin/gallery`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load gallery');
        }
        
        const gallery = await response.json();
        renderAdminGallery(gallery);
    } catch (error) {
        console.error('Error loading admin gallery:', error);
        renderError('galleryList', 'Failed to load gallery');
    }
}

// Render admin gallery
function renderAdminGallery(gallery) {
    const galleryList = document.getElementById('galleryList');
    
    if (gallery.length === 0) {
        galleryList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>No Gallery Images Yet</h3>
                <p>Add your first image using the form above</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="gallery-container">';
    
    gallery.forEach(item => {
        html += `
            <div class="gallery-item">
                <img src="${item.image_url}" alt="${item.caption || 'Gallery Image'}">
                <div class="gallery-overlay">
                    <p>${item.caption || 'No caption'}</p>
                    <button class="action-btn delete-btn" onclick="deleteGalleryImage(${item.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    galleryList.innerHTML = html;
}

// Handle add gallery image
async function handleAddGallery(e) {
    e.preventDefault();
    
    const imageUrl = document.getElementById('galleryImageUrl').value;
    const caption = document.getElementById('galleryCaption').value;
    const category = document.getElementById('galleryCategory').value;
    const featured = document.getElementById('galleryFeatured').checked;
    
    const addGalleryText = document.getElementById('addGalleryText');
    const addGallerySpinner = document.getElementById('addGallerySpinner');
    
    // Show loading state
    addGalleryText.style.display = 'none';
    addGallerySpinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/gallery`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: caption,
                category: category,
                is_featured: featured
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add gallery image');
        }
        
        // Reset form
        e.target.reset();
        
        // Reload gallery list
        loadAdminGallery();
        
        // Show success message
        showNotification('Image added to gallery successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding gallery image:', error);
        showNotification('Failed to add image: ' + error.message, 'error');
    } finally {
        // Restore button state
        addGalleryText.style.display = 'inline';
        addGallerySpinner.style.display = 'none';
    }
}

// Delete gallery image
async function deleteGalleryImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/gallery/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete image');
        }
        
        // Reload gallery list
        loadAdminGallery();
        
        // Show success message
        showNotification('Image deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        showNotification('Failed to delete image: ' + error.message, 'error');
    }
}

// Load admin messages
async function loadAdminMessages() {
    try {
        showLoading('messagesList', 'Loading messages...');
        
        const response = await fetch(`${API_BASE_URL}/admin/messages`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const messages = await response.json();
        renderAdminMessages(messages);
    } catch (error) {
        console.error('Error loading admin messages:', error);
        renderError('messagesList', 'Failed to load messages');
    }
}

// Render admin messages
function renderAdminMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>No Messages Yet</h3>
                <p>No contact messages have been submitted yet</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    messages.forEach(message => {
        const messageDate = new Date(message.submitted_at);
        const formattedDate = messageDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const borderColor = message.is_read ? '#ccc' : 'var(--primary)';
        const phoneHtml = message.phone ? `<p><strong>Phone:</strong> ${message.phone}</p>` : '';
        const markAsReadButton = !message.is_read ? 
            `<button class="action-btn" onclick="markMessageAsRead(${message.id})" style="background-color: var(--primary); color: white; margin-top: 10px;">Mark as Read</button>` : 
            '';
        
        html += `
            <div class="message-card" style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; border-left: 5px solid ${borderColor};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <h4 style="margin: 0;">${message.name}</h4>
                    <span style="color: var(--gray); font-size: 0.9rem;">${formattedDate}</span>
                </div>
                <p><strong>Email:</strong> ${message.email}</p>
                ${phoneHtml}
                <p><strong>Message:</strong> ${message.message}</p>
                ${markAsReadButton}
            </div>
        `;
    });
    
    messagesList.innerHTML = html;
}

// Mark message as read
async function markMessageAsRead(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark message as read');
        }
        
        // Reload messages
        loadAdminMessages();
        
        // Show success message
        showNotification('Message marked as read', 'success');
        
    } catch (error) {
        console.error('Error marking message as read:', error);
        showNotification('Failed to mark message as read: ' + error.message, 'error');
    }
}

// Handle save settings
async function handleSaveSettings(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const saveSettingsText = document.getElementById('saveSettingsText');
    const saveSettingsSpinner = document.getElementById('saveSettingsSpinner');
    
    // Show loading state
    saveSettingsText.style.display = 'none';
    saveSettingsSpinner.style.display = 'inline-block';
    
    try {
        if (password && password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        // In a real app, you would call an API endpoint to update settings
        // For now, just show a success message
        setTimeout(() => {
            showNotification('Settings saved successfully! (Note: In production, this would update the database)', 'success');
            e.target.reset();
            
            // Restore button state
            saveSettingsText.style.display = 'inline';
            saveSettingsSpinner.style.display = 'none';
        }, 1000);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings: ' + error.message, 'error');
        
        // Restore button state
        saveSettingsText.style.display = 'inline';
        saveSettingsSpinner.style.display = 'none';
    }
}

// Utility functions
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

function renderError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.getElementById('adminNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'adminNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#17a2b8';
    }
    
    notification.textContent = message;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Make functions globally available for onclick handlers
window.editSlide = editSlide;
window.deleteSlide = deleteSlide;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.deleteGalleryImage = deleteGalleryImage;
window.markMessageAsRead = markMessageAsRead;