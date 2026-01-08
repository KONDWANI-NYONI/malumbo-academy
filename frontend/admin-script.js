// API Configuration
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminPanel = document.getElementById('admin-panel');
const slidesList = document.getElementById('slides-list');
const addSlideForm = document.getElementById('add-slide-form');
const logoutBtn = document.getElementById('logout-btn');
const formMessage = document.getElementById('form-message');
const slidesCount = document.getElementById('slides-count');

// Login function
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    loginError.textContent = '';
    loginError.className = 'message';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store login status
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            // Show success message
            loginError.textContent = '✅ Login successful!';
            loginError.className = 'message success';
            
            // Show admin panel after delay
            setTimeout(() => {
                showAdminPanel();
                loadSlides();
            }, 1000);
        } else {
            loginError.textContent = data.message || 'Login failed. Please try again.';
            loginError.className = 'message error';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.innerHTML = `
            <div class="message error">
                <p><strong>Connection Error</strong></p>
                <p>Please check:</p>
                <ul>
                    <li>Backend server is running at: ${API_BASE_URL}</li>
                    <li>Check browser console (F12) for details</li>
                </ul>
            </div>
        `;
    }
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    adminPanel.style.display = 'block';
    
    // Show username
    const username = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('admin-welcome').textContent = `Welcome, ${username}!`;
}

// Load slides for admin
async function loadSlides() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch slides: ${response.status}`);
        }
        
        const slides = await response.json();
        slidesCount.textContent = slides.length;
        
        if (slides.length === 0) {
            slidesList.innerHTML = '<div class="message">No slides found. Add your first slide!</div>';
            return;
        }
        
        slidesList.innerHTML = slides.map(slide => `
            <div class="slide-item">
                <img src="${slide.image_url}" alt="${slide.title}" 
                     onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'">
                <div class="slide-info">
                    <h4>${slide.title}</h4>
                    <p>${slide.description || 'No description'}</p>
                    <small>ID: ${slide.id} | Created: ${new Date(slide.created_at).toLocaleDateString()}</small>
                </div>
                <button onclick="deleteSlide(${slide.id})" class="btn btn-danger" style="width: auto;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading slides:', error);
        slidesList.innerHTML = `
            <div class="message error">
                <p><strong>Error loading slides:</strong> ${error.message}</p>
                <button onclick="loadSlides()" class="btn" style="width: auto; margin-top: 10px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Add new slide
async function handleAddSlide(event) {
    event.preventDefault();
    
    const title = document.getElementById('slide-title').value;
    const description = document.getElementById('slide-description').value;
    const imageUrl = document.getElementById('slide-image').value;
    
    if (!title || !imageUrl) {
        formMessage.textContent = 'Please fill in at least Title and Image URL';
        formMessage.className = 'message error';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                title, 
                description, 
                image_url: imageUrl 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            formMessage.textContent = '✅ Slide added successfully!';
            formMessage.className = 'message success';
            
            // Clear form
            addSlideForm.reset();
            
            // Reload slides
            setTimeout(() => {
                formMessage.textContent = '';
                loadSlides();
            }, 2000);
        } else {
            formMessage.textContent = data.message || 'Failed to add slide';
            formMessage.className = 'message error';
        }
    } catch (error) {
        console.error('Error adding slide:', error);
        formMessage.textContent = 'Error adding slide. Check console for details.';
        formMessage.className = 'message error';
    }
}

// Delete slide
async function deleteSlide(id) {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Slide deleted successfully!');
            loadSlides(); // Refresh the list
        } else {
            alert(data.message || 'Failed to delete slide');
        }
    } catch (error) {
        console.error('Error deleting slide:', error);
        alert('Error deleting slide');
    }
}

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        adminPanel.style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
        if (loginForm) loginForm.reset();
        loginError.textContent = '';
    }
}

// Check if already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAdminPanel();
        loadSlides();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (addSlideForm) {
        addSlideForm.addEventListener('submit', handleAddSlide);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Make functions available globally
window.deleteSlide = deleteSlide;
window.loadSlides = loadSlides;