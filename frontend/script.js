const API_BASE_URL = 'https://malumbo-academy-api.onrender.com/api';

async function loadSlides() {
    const container = document.getElementById('slides-container');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    try {
        loading.textContent = 'Loading slides...';
        error.textContent = '';
        
        const response = await fetch(\`\${API_BASE_URL}/slides\`);
        
        if (!response.ok) {
            throw new Error(\`API Error: \${response.status}\`);
        }
        
        const slides = await response.json();
        
        if (slides.length === 0) {
            container.innerHTML = '<p>No slides available</p>';
            return;
        }
        
        container.innerHTML = slides.map(slide => \`
            <div class="slide">
                <img src="\${slide.image_url}" alt="\${slide.title}">
                <h3>\${slide.title}</h3>
                <p>\${slide.description}</p>
            </div>
        \`).join('');
        
        loading.textContent = '';
        
    } catch (err) {
        console.error('Error:', err);
        loading.textContent = '';
        error.textContent = \`Failed to load slides. Error: \${err.message}\`;
    }
}

document.addEventListener('DOMContentLoaded', loadSlides);
