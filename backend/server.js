const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (no PostgreSQL needed for now)
let slides = [
  {
    id: 1,
    title: "Welcome to Malumbo Academy",
    description: "Quality education for all students",
    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Interactive Learning",
    description: "Engaging classroom experiences",
    image_url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Expert Teachers",
    description: "Qualified and experienced educators",
    image_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
    created_at: new Date().toISOString()
  }
];

// ========== PUBLIC ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Malumbo Academy API',
    version: '1.0.0',
    database: 'In-memory',
    slidesCount: slides.length
  });
});

// Get all slides
app.get('/api/slides', (req, res) => {
  res.json(slides);
});

// ========== ADMIN ROUTES ==========

// Admin login (simple authentication)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password required'
    });
  }
  
  // Simple hardcoded credentials
  if (username === 'admin' && password === 'admin123') {
    return res.json({
      success: true,
      message: 'Login successful',
      user: { username, role: 'admin' }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Get slides for admin panel
app.get('/api/admin/slides', (req, res) => {
  res.json(slides);
});

// Add new slide
app.post('/api/admin/slides', (req, res) => {
  const { title, description, image_url } = req.body;
  
  if (!title || !image_url) {
    return res.status(400).json({
      success: false,
      message: 'Title and image URL are required'
    });
  }
  
  const newSlide = {
    id: slides.length + 1,
    title,
    description: description || '',
    image_url,
    created_at: new Date().toISOString()
  };
  
  slides.push(newSlide);
  
  res.json({
    success: true,
    slide: newSlide,
    message: 'Slide added successfully'
  });
});

// Delete slide
// Delete slide endpoint (should be in your backend)
app.delete('/api/admin/slides/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // If using in-memory database
        const initialLength = slides.length;
        slides = slides.filter(slide => slide.id !== parseInt(id));
        
        if (slides.length < initialLength) {
            res.json({
                success: true,
                message: 'Slide deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Slide not found'
            });
        }
    } catch (error) {
        console.error('Error deleting slide:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete slide' 
        });
    }
});

// Serve frontend files (for combined deployment)
app.use(express.static('../frontend'));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Malumbo Academy API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin.html`);
});