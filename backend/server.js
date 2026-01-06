const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['https://malumbo-academy-website.onrender.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// PostgreSQL connection with Render compatibility
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false  // Required for Render PostgreSQL
    }
});

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'malumbo-academy-secret-key-2023';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Public Routes

// Get all active slides
app.get('/api/slides', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM slides WHERE is_active = true ORDER BY display_order, created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching slides:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get upcoming events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM events 
             WHERE is_published = true AND event_date >= CURRENT_DATE 
             ORDER BY event_date ASC LIMIT 10`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get gallery images
app.get('/api/gallery', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gallery ORDER BY uploaded_at DESC LIMIT 20'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching gallery:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }
        
        const result = await pool.query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, message]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Message submitted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // For demo purposes - in production, use proper password hashing
        // IMPORTANT: Change this in production!
        if (password === 'malumbo2023' || password === user.password_hash) {
            // Update last login
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Admin Routes

// Get all slides (admin)
app.get('/api/admin/slides', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM slides ORDER BY display_order, created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin slides:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new slide
app.post('/api/admin/slides', authenticateToken, async (req, res) => {
    try {
        const { image_url, title, description, display_order, is_active } = req.body;
        
        if (!image_url || !title) {
            return res.status(400).json({ error: 'Image URL and title are required' });
        }
        
        const result = await pool.query(
            `INSERT INTO slides (image_url, title, description, display_order, is_active) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [image_url, title, description || '', display_order || 0, is_active !== false]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Slide added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding slide:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update slide
app.put('/api/admin/slides/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, title, description, display_order, is_active } = req.body;
        
        const result = await pool.query(
            `UPDATE slides 
             SET image_url = $1, title = $2, description = $3, 
                 display_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [image_url, title, description, display_order, is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Slide not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Slide updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating slide:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete slide
app.delete('/api/admin/slides/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM slides WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Slide not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Slide deleted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error deleting slide:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all events (admin)
app.get('/api/admin/events', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM events ORDER BY event_date DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin events:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new event
app.post('/api/admin/events', authenticateToken, async (req, res) => {
    try {
        const { title, description, event_date, event_time, location, is_published } = req.body;
        
        if (!title || !description || !event_date) {
            return res.status(400).json({ error: 'Title, description, and date are required' });
        }
        
        const result = await pool.query(
            `INSERT INTO events (title, description, event_date, event_time, location, is_published) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, event_date, event_time || '', location || '', is_published !== false]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Event added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update event
app.put('/api/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, event_time, location, is_published } = req.body;
        
        const result = await pool.query(
            `UPDATE events 
             SET title = $1, description = $2, event_date = $3, 
                 event_time = $4, location = $5, is_published = $6 
             WHERE id = $7 RETURNING *`,
            [title, description, event_date, event_time, location, is_published, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Event updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete event
app.delete('/api/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Event deleted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all gallery images (admin)
app.get('/api/admin/gallery', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gallery ORDER BY uploaded_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching admin gallery:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add gallery image
app.post('/api/admin/gallery', authenticateToken, async (req, res) => {
    try {
        const { image_url, caption, category, is_featured } = req.body;
        
        if (!image_url) {
            return res.status(400).json({ error: 'Image URL is required' });
        }
        
        const result = await pool.query(
            `INSERT INTO gallery (image_url, caption, category, is_featured) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [image_url, caption || '', category || 'general', is_featured || false]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Image added to gallery successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding gallery image:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete gallery image
app.delete('/api/admin/gallery/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM gallery WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Image deleted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error deleting gallery image:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get contact messages (admin)
app.get('/api/admin/messages', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contact_messages ORDER BY submitted_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark message as read
app.put('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ 
            success: true,
            message: 'Message marked as read',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error marking message as read:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get dashboard stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const slidesCount = await pool.query('SELECT COUNT(*) FROM slides');
        const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
        const galleryCount = await pool.query('SELECT COUNT(*) FROM gallery');
        const messagesCount = await pool.query('SELECT COUNT(*) FROM contact_messages WHERE is_read = false');
        
        res.json({
            success: true,
            data: {
                slides: parseInt(slidesCount.rows[0].count),
                events: parseInt(eventsCount.rows[0].count),
                gallery: parseInt(galleryCount.rows[0].count),
                unreadMessages: parseInt(messagesCount.rows[0].count)
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Malumbo Academy API',
        version: '1.0.0'
    });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as time, version() as version');
        res.json({
            success: true,
            database: 'Connected',
            time: result.rows[0].time,
            version: result.rows[0].version
        });
    } catch (err) {
        console.error('Database connection test failed:', err);
        res.status(500).json({ 
            success: false,
            error: 'Database connection failed',
            message: err.message
        });
    }
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Malumbo Academy API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS allowed origins: ${process.env.NODE_ENV === 'production' ? 'Production frontend' : 'Development'}`);
});