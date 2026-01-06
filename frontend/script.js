// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-render-app.onrender.com/api'; // Update with your Render URL

// Global state
let currentSlide = 0;
let slideshowInterval;

// DOM Elements
const slideshow = document.getElementById('slideshow');
const eventsContainer = document.getElementById('eventsContainer');
const galleryContainer = document.getElementById('galleryContainer');
const contactForm = document.getElementById('inquiryForm');
const imageModal = document.getElementById('imageModal');

// Initialize website
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load data from API
    loadSlides();
    loadEvents();
    loadGallery();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
    
    // Close image modal
    const closeImageModal = document.getElementById('closeImageModal');
    if (closeImageModal) {
        closeImageModal.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Load slides from API
async function loadSlides() {
    try {
        const response = await fetch(`${API_BASE_URL}/slides`);
        
        if (!response.ok) {
            throw new Error('Failed to load slides');
        }
        
        const slides = await response.json();
        
        if (slides.length === 0) {
            renderNoSlides();
            return;
        }
        
        renderSlideshow(slides);
        startSlideshow();
    } catch (error) {
        console.error('Error loading slides:', error);
        renderError(slideshow, 'Failed to load slides. Please try again later.');
    }
}

// Render slideshow
function renderSlideshow(slides) {
    slideshow.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
        slideElement.style.backgroundImage = `url('${slide.image_url}')`;
        
        const slideContent = document.createElement('div');
        slideContent.className = 'slide-content';
        slideContent.innerHTML = `
            <h2>${slide.title}</h2>
            <p>${slide.description || ''}</p>
        `;
        
        slideElement.appendChild(slideContent);
        slideshow.appendChild(slideElement);
    });
    
    // Add navigation controls if we have slides
    if (slides.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slide-nav slide-prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', prevSlide);
        slideshow.appendChild(prevBtn);
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'slide-nav slide-next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', nextSlide);
        slideshow.appendChild(nextBtn);
        
        // Add slide indicators
        const controls = document.createElement('div');
        controls.className = 'slide-controls';
        
        slides.forEach((_, index) => {
            const control = document.createElement('button');
            control.className = `slide-control ${index === 0 ? 'active' : ''}`;
            control.addEventListener('click', () => goToSlide(index));
            controls.appendChild(control);
        });
        
        slideshow.appendChild(controls);
    }
}

// No slides state
function renderNoSlides() {
    slideshow.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-images"></i>
            <h3>No Slides Available</h3>
            <p>Check back later for updates</p>
        </div>
    `;
}

// Slideshow functions
function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const controls = document.querySelectorAll('.slide-control');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.remove('active');
    }
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.add('active');
    }
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    const controls = document.querySelectorAll('.slide-control');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.remove('active');
    }
    
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.add('active');
    }
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const controls = document.querySelectorAll('.slide-control');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.remove('active');
    }
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    if (controls[currentSlide]) {
        controls[currentSlide].classList.add('active');
    }
}

function startSlideshow() {
    clearInterval(slideshowInterval);
    
    // Only start slideshow if we have more than 1 slide
    if (document.querySelectorAll('.slide').length > 1) {
        slideshowInterval = setInterval(nextSlide, 5000);
    }
}

// Load events from API
async function loadEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        
        if (!response.ok) {
            throw new Error('Failed to load events');
        }
        
        const events = await response.json();
        
        if (events.length === 0) {
            renderNoEvents();
            return;
        }
        
        renderEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        renderError(eventsContainer, 'Failed to load events. Please try again later.');
    }
}

// Render events
function renderEvents(events) {
    eventsContainer.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.event_date);
        const month = eventDate.toLocaleString('default', { month: 'short' });
        const day = eventDate.getDate();
        
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="event-meta">
                    ${event.event_time ? `<span><i class="far fa-clock"></i> ${event.event_time}</span>` : ''}
                    ${event.location ? `<span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>` : ''}
                </div>
            </div>
        `;
        
        eventsContainer.appendChild(eventCard);
    });
}

// No events state
function renderNoEvents() {
    eventsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-alt"></i>
            <h3>No Upcoming Events</h3>
            <p>Check back later for upcoming events</p>
        </div>
    `;
}

// Load gallery from API
async function loadGallery() {
    try {
        const response = await fetch(`${API_BASE_URL}/gallery`);
        
        if (!response.ok) {
            throw new Error('Failed to load gallery');
        }
        
        const gallery = await response.json();
        
        if (gallery.length === 0) {
            renderNoGallery();
            return;
        }
        
        renderGallery(gallery);
    } catch (error) {
        console.error('Error loading gallery:', error);
        renderError(galleryContainer, 'Failed to load gallery. Please try again later.');
    }
}

// Render gallery
function renderGallery(gallery) {
    galleryContainer.innerHTML = '';
    
    gallery.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.caption || 'Gallery Image'}" loading="lazy">
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        `;
        
        galleryItem.addEventListener('click', () => openImageModal(item.image_url, item.caption));
        galleryContainer.appendChild(galleryItem);
    });
}

// No gallery state
function renderNoGallery() {
    galleryContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-camera"></i>
            <h3>No Gallery Images</h3>
            <p>Check back later for gallery updates</p>
        </div>
    `;
}

// Open image modal
function openImageModal(imageUrl, caption) {
    document.getElementById('modalImage').src = imageUrl;
    const captionElement = document.getElementById('modalCaption');
    captionElement.textContent = caption || '';
    imageModal.style.display = 'flex';
}

// Submit contact form
async function submitContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const formMessage = document.getElementById('formMessage');
    
    // Show loading state
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline-block';
    formMessage.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, message })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit message');
        }
        
        // Show success message
        formMessage.textContent = 'Thank you for your message! We will contact you soon.';
        formMessage.className = 'form-message success';
        formMessage.style.display = 'block';
        
        // Reset form
        contactForm.reset();
        
        // Scroll to form message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Error submitting contact form:', error);
        
        // Show error message
        formMessage.textContent = 'Failed to submit message. Please try again.';
        formMessage.className = 'form-message error';
        formMessage.style.display = 'block';
        
    } finally {
        // Restore button state
        submitText.style.display = 'inline';
        submitSpinner.style.display = 'none';
    }
}

// Render error message
function renderError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Check API health
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}