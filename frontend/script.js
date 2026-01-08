// API Configuration
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

// Load slides for slideshow and gallery
async function loadAllSlides() {
    try {
        const response = await fetch(`${API_BASE_URL}/slides`);
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const slides = await response.json();
        
        if (slides.length > 0) {
            initSlideshow(slides);
            displayGallery(slides);
        } else {
            useDefaultImages();
        }
    } catch (err) {
        console.error('Error loading slides:', err);
        useDefaultImages();
    }
}

// Initialize Slideshow
function initSlideshow(slides) {
    const container = document.querySelector('.slideshow-container');
    if (!container) return;
    
    // Clear and create slides
    container.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
        slideElement.innerHTML = `
            <div class="slide-image" style="background-image: url('${slide.image_url}')"></div>
            <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.description}</p>
                <a href="#courses" class="cta-button">Explore Courses</a>
            </div>
        `;
        container.appendChild(slideElement);
    });
    
    // Start slideshow
    startSlideshow();
}

// Start slideshow animation
function startSlideshow() {
    let currentIndex = 0;
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 5000);
}

// Display Gallery
function displayGallery(slides) {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    const itemsToShow = slides.slice(0, 6);
    
    container.innerHTML = itemsToShow.map(slide => `
        <div class="gallery-item">
            <img src="${slide.image_url}" alt="${slide.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'">
            <div class="gallery-overlay">
                <h4>${slide.title}</h4>
                <p>${slide.description || ''}</p>
            </div>
        </div>
    `).join('');
}

// Use default images if API fails
function useDefaultImages() {
    const defaultSlides = [
        {
            title: "Welcome to Malumbo Academy",
            description: "Quality education for all students",
            image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
        },
        {
            title: "Interactive Learning",
            description: "Engaging classroom experiences",
            image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"
        },
        {
            title: "Modern Facilities",
            description: "State-of-the-art learning environment",
            image_url: "https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=800&q=80"
        }
    ];
    
    initSlideshow(defaultSlides);
    displayGallery(defaultSlides);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAllSlides();
    
    // Mobile menu
    const menuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
