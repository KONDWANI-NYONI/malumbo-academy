const API_BASE_URL = 'https://malumbo-academy-api.onrender.com/api';

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminPanel = document.getElementById('admin-panel');
const slidesList = document.getElementById('slides-list');
const addSlideForm = document.getElementById('add-slide-form');
const logoutBtn = document.getElementById('logout-btn');

// Login function
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    loginError.textContent = '';
    loginError.style.color = 'red';
    
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
            // Store auth token/session
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            loginError.textContent = '✅ Login successful!';
            loginError.style.color = 'green';
            
            setTimeout(() => {
                showAdminPanel();
                loadSlides();
            }, 1000);
        } else {
            loginError.textContent = data.message || 'Login failed. Please try again.';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Connection error. Please check:';
        loginError.innerHTML += `<br>1. Backend is running at: ${API_BASE_URL}`;
        loginError.innerHTML += `<br>2. Check browser console (F12) for details`;
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
        
        if (slides.length === 0) {
            slidesList.innerHTML = '<p>No slides found. Add your first slide!</p>';
            return;
        }
        
        slidesList.innerHTML = slides.map(slide => `
            <div class="slide-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                <img src="${slide.image_url}" alt="${slide.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0;">${slide.title}</h4>
                    <p style="margin: 0 0 5px 0; color: #666;">${slide.description || 'No description'}</p>
                    <small style="color: #999;">ID: ${slide.id} | Created: ${new Date(slide.created_at).toLocaleDateString()}</small>
                </div>
                <button onclick="deleteSlide(${slide.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                    Delete
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading slides:', error);
        slidesList.innerHTML = `
            <div style="color: #dc3545; padding: 20px; text-align: center;">
                <p>❌ Error loading slides: ${error.message}</p>
                <button onclick="loadSlides()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    Retry
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
        alert('Please fill in at least Title and Image URL');
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
            alert('✅ Slide added successfully!');
            addSlideForm.reset();
            loadSlides(); // Refresh the list
        } else {
            alert(`Failed to add slide: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error adding slide:', error);
        alert('Error adding slide. Check console for details.');
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
            alert('Failed to delete slide');
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
        loginForm.reset();
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
