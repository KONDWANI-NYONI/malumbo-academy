// API Configuration
const API_BASE_URL = window.location.hostname.includes('render.com') 
    ? 'https://malumbo-academy-api.onrender.com/api'
    : 'http://localhost:5000/api';

// Slideshow Variables
let currentSlide = 0;
let slideInterval;

// Initialize Slideshow
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    if (slides.length === 0) return;
    
    // Function to show slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide
        slides[index].classList.add('active');
        
        // Activate corresponding dot
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    // Start slideshow
    function startSlideshow() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            let nextSlide = (currentSlide + 1) % slides.length;
            showSlide(nextSlide);
        }, 5000); // Change slide every 5 seconds
    }
    
    // Event Listeners for Slideshow
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            let prevSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevSlide);
            startSlideshow(); // Restart interval
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            let nextSlide = (currentSlide + 1) % slides.length;
            showSlide(nextSlide);
            startSlideshow(); // Restart interval
        });
    }
    
    // Dot Navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startSlideshow(); // Restart interval
        });
    });
    
    // Show first slide and start slideshow
    showSlide(0);
    startSlideshow();
    
    // Pause slideshow on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slideshowContainer.addEventListener('mouseleave', () => {
            startSlideshow();
        });
    }
}

// Load Gallery Images from API
async function loadGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    
    if (!galleryContainer) return;
    
    try {
        galleryContainer.innerHTML = `
            <div class="loading" style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Loading gallery...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/slides`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const slides = await response.json();
        let galleryItems;
        
        if (slides.length === 0) {
            console.log('No slides from API, using default gallery images');
            // Use default gallery images
            galleryItems = [
                {
                    id: 1,
                    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
                    title: 'Modern Campus',
                    description: 'State-of-the-art campus facilities'
                },
                {
                    id: 2,
                    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
                    title: 'Library',
                    description: 'Extensive collection of books and resources'
                },
                {
                    id: 3,
                    image_url: 'https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=800&q=80',
                    title: 'Classroom',
                    description: 'Modern learning environment'
                },
                {
                    id: 4,
                    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
                    title: 'Laboratory',
                    description: 'Advanced science laboratories'
                },
                {
                    id: 5,
                    image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
                    title: 'Sports Complex',
                    description: 'Sports and fitness facilities'
                },
                {
                    id: 6,
                    image_url: 'https://images.unsplash.com/photo-1519070994522-88c6b756330e?w=800&q=80',
                    title: 'Cafeteria',
                    description: 'Healthy dining options'
                }
            ];
        } else {
            console.log(`Loaded ${slides.length} slides from API`);
            galleryItems = slides.slice(0, 6); // Take first 6 slides
        }
        
        // Display gallery
        displayGallery(galleryItems);
        
    } catch (err) {
        console.error('Error loading gallery:', err);
        // Use fallback images
        const fallbackImages = [
            {
                id: 1,
                image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
                title: 'Modern Campus',
                description: 'State-of-the-art campus facilities'
            },
            {
                id: 2,
                image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
                title: 'Library',
                description: 'Extensive collection of books and resources'
            },
            {
                id: 3,
                image_url: 'https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=800&q=80',
                title: 'Classroom',
                description: 'Modern learning environment'
            }
        ];
        displayGallery(fallbackImages);
    }
}

// Display Gallery Items
function displayGallery(galleryItems) {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;
    
    if (!galleryItems || galleryItems.length === 0) {
        galleryContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-images" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>No gallery images available</p>
            </div>
        `;
        return;
    }
    
    galleryContainer.innerHTML = galleryItems.map(item => `
        <div class="gallery-item">
            <img src="${item.image_url}" alt="${item.title}" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.description || ''}</p>
            </div>
        </div>
    `).join('');
    
    console.log(`Displayed ${galleryItems.length} gallery items`);
}

// Gallery Navigation
let currentGalleryPage = 0;
function navigateGallery(direction) {
    const galleryContainer = document.getElementById('gallery-container');
    const items = galleryContainer.querySelectorAll('.gallery-item');
    
    if (items.length === 0) return;
    
    const itemsPerPage = window.innerWidth <= 768 ? 2 : 3;
    
    // Hide all items
    items.forEach(item => {
        item.style.display = 'none';
    });
    
    if (direction === 'next') {
        currentGalleryPage++;
        const startIndex = (currentGalleryPage * itemsPerPage) % items.length;
        
        for (let i = 0; i < itemsPerPage; i++) {
            const index = (startIndex + i) % items.length;
            items[index].style.display = 'block';
        }
    } else {
        currentGalleryPage--;
        if (currentGalleryPage < 0) {
            currentGalleryPage = Math.ceil(items.length / itemsPerPage) - 1;
        }
        const startIndex = (currentGalleryPage * itemsPerPage) % items.length;
        
        for (let i = 0; i < itemsPerPage; i++) {
            const index = (startIndex + i) % items.length;
            items[index].style.display = 'block';
        }
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// Contact Form Handler
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                subject: this.querySelectorAll('input[type="text"]')[1].value,
                message: this.querySelector('textarea').value
            };
            
            // In a real application, you would send this to your backend
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
}

// Newsletter Form Handler
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Test API Connection
async function testApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('API Connection Successful:', data);
            return true;
        }
    } catch (error) {
        console.warn('API Connection Failed:', error.message);
        console.log('Using fallback mode for gallery');
    }
    return false;
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Malumbo Academy website...');
    
    // Test API connection first
    await testApiConnection();
    
    // Initialize components
    initSlideshow();
    await loadGallery();
    initMobileMenu();
    initContactForm();
    initNewsletter();
    initSmoothScrolling();
    
    // Add active class to current nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Add active class to home link by default
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) {
        homeLink.classList.add('active');
    }
    
    console.log('Website initialization complete');
});

// Handle image errors globally
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80';
            e.target.alt = 'Default Campus Image';
        }
    }, true);
});