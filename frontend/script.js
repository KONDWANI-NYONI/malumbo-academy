// API Configuration
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

// Global variables
let allSlides = [];
let currentSlideIndex = 0;
let slideInterval;

// Load all slides from API
async function loadAllSlides() {
    try {
        console.log('Loading slides from database...');
        const response = await fetch(`${API_BASE_URL}/slides`);
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        allSlides = await response.json();
        
        if (allSlides.length === 0) {
            console.log('No slides in database');
            allSlides = getDefaultSlides();
        }
        
        console.log(`Loaded ${allSlides.length} slides from database`);
        
        // Initialize everything
        initSlideshow();
        displayGallery();
        setupEventListeners();
        
    } catch (err) {
        console.error('Error loading slides:', err);
        allSlides = getDefaultSlides();
        initSlideshow();
        displayGallery();
        setupEventListeners();
    }
}

// Get default slides if API fails
function getDefaultSlides() {
    return [
        {
            id: 1,
            title: "Welcome to Malumbo Academy",
            description: "Where innovation meets excellence in education",
            image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80"
        },
        {
            id: 2,
            title: "Modern Learning Spaces",
            description: "State-of-the-art facilities designed for optimal learning",
            image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
        },
        {
            id: 3,
            title: "Expert Faculty",
            description: "Learn from industry professionals and academic leaders",
            image_url: "https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=1600&q=80"
        }
    ];
}

// Initialize Slideshow
function initSlideshow() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    // Clear container
    slideshowContainer.innerHTML = '';
    
    // Create slides
    allSlides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
        slideElement.innerHTML = `
            <div class="slide-image" style="background-image: url('${slide.image_url}')"></div>
            <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.description}</p>
                <a href="#contact" class="cta-button">Join Today</a>
            </div>
        `;
        slideshowContainer.appendChild(slideElement);
    });
    
    // Create navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slideshow-dots';
    
    allSlides.slice(0, 5).forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('data-slide', index);
        dotsContainer.appendChild(dot);
    });
    
    slideshowContainer.appendChild(dotsContainer);
    
    // Create navigation arrows
    const prevArrow = document.createElement('button');
    prevArrow.className = 'slideshow-arrow prev-arrow';
    prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const nextArrow = document.createElement('button');
    nextArrow.className = 'slideshow-arrow next-arrow';
    nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    slideshowContainer.appendChild(prevArrow);
    slideshowContainer.appendChild(nextArrow);
    
    // Start slideshow
    startSlideshow();
}

// Start slideshow with auto-play
function startSlideshow() {
    clearInterval(slideInterval);
    
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

// Show specific slide
function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Handle circular navigation
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Remove active from all dots
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    slides[index].classList.add('active');
    
    // Activate corresponding dot
    const dotIndex = index % Math.min(5, allSlides.length);
    if (dots[dotIndex]) {
        dots[dotIndex].classList.add('active');
    }
    
    currentSlideIndex = index;
}

// Next slide
function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

// Previous slide
function prevSlide() {
    showSlide(currentSlideIndex - 1);
}

// Display Gallery
function displayGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    // Use first 6 slides for gallery
    const itemsToShow = allSlides.slice(0, 6);
    
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

// Setup event listeners
function setupEventListeners() {
    // Slideshow navigation
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const dots = document.querySelectorAll('.dot');
    
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            prevSlide();
            startSlideshow();
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            nextSlide();
            startSlideshow();
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startSlideshow();
        });
    });
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Malumbo Academy website...');
    loadAllSlides();
});
