const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

// Login function
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            loadSlides();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.style.color = 'red';
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Check console.';
        errorDiv.style.color = 'red';
        console.error('Login error:', error);
    }
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}

// Load slides
async function loadSlides() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides`);
        const slides = await response.json();
        
        const container = document.getElementById('slides-list');
        const countSpan = document.getElementById('slides-count');
        
        countSpan.textContent = slides.length;
        
        container.innerHTML = slides.map(slide => `
            <div class="slide-item" data-id="${slide.id}">
                <img src="${slide.image_url}" alt="${slide.title}" width="100">
                <div>
                    <h4>${slide.title}</h4>
                    <p>${slide.description || 'No description'}</p>
                    <small>ID: ${slide.id}</small>
                </div>
                <button onclick="deleteSlide(${slide.id})" class="delete-btn">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading slides:', error);
    }
}

// Add slide
async function handleAddSlide(event) {
    event.preventDefault();
    
    const title = document.getElementById('slide-title').value;
    const description = document.getElementById('slide-description').value;
    const imageUrl = document.getElementById('slide-image').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, image_url: imageUrl })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Slide added successfully!');
            document.getElementById('add-slide-form').reset();
            loadSlides();
        } else {
            alert('Failed to add slide: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding slide:', error);
        alert('Error adding slide');
    }
}

// Delete slide - FIXED
async function deleteSlide(id) {
    if (!confirm('Delete this slide?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/slides/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove from UI
            const item = document.querySelector(`.slide-item[data-id="${id}"]`);
            if (item) item.remove();
            
            // Update count
            const count = document.querySelectorAll('.slide-item').length;
            document.getElementById('slides-count').textContent = count;
            
            alert('Slide deleted!');
        } else {
            alert('Failed to delete: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting slide:', error);
        alert('Error deleting slide');
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

// Check login status
if (localStorage.getItem('adminLoggedIn') === 'true') {
    showAdminPanel();
    loadSlides();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const addForm = document.getElementById('add-slide-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (addForm) addForm.addEventListener('submit', handleAddSlide);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});

// Make functions global
window.deleteSlide = deleteSlide;
