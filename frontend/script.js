// API Configuration - Use your Render URL
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

async function loadSlides() {
    const container = document.getElementById('slides-container');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    try {
        loading.textContent = 'Loading slides...';
        error.textContent = '';
        
        const response = await fetch(`${API_BASE_URL}/slides`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const slides = await response.json();
        
        if (slides.length === 0) {
            container.innerHTML = '<p class="empty-state">No slides available</p>';
            return;
        }
        
        container.innerHTML = slides.map(slide => `
            <div class="slide">
                <img src="${slide.image_url}" alt="${slide.title}" onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'">
                <h3>${slide.title}</h3>
                <p>${slide.description}</p>
            </div>
        `).join('');
        
        loading.textContent = '';
        
    } catch (err) {
        console.error('Error:', err);
        loading.textContent = '';
        error.textContent = `Failed to load slides. Error: ${err.message}`;
        
        // Fallback with sample slides
        container.innerHTML = `
            <div class="slide">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" alt="Welcome">
                <h3>Welcome to Malumbo Academy</h3>
                <p>Quality education for all students</p>
            </div>
            <div class="slide">
                <img src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80" alt="Learning">
                <h3>Interactive Learning</h3>
                <p>Engaging classroom experiences</p>
            </div>
        `;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadSlides);