const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Malumbo Academy API',
        version: '1.0.0',
        database: 'PostgreSQL'
    });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as time, version() as version');
        res.json({
            status: 'connected',
            database: 'PostgreSQL',
            time: result.rows[0].time,
            version: result.rows[0].version,
            message: 'Database connection successful'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            message: 'Database connection failed'
        });
    }
});

// Initialize database
app.get('/api/init-db', async (req, res) => {
    try {
        // Create slides table
        await pool.query(\`
            CREATE TABLE IF NOT EXISTS slides (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        \`);
        
        // Check if table has data
        const check = await pool.query('SELECT COUNT(*) as count FROM slides');
        const count = parseInt(check.rows[0].count);
        
        let message = 'Database initialized';
        if (count === 0) {
            // Insert sample data
            await pool.query(\`
                INSERT INTO slides (title, description, image_url) VALUES
                ('Welcome to Malumbo Academy', 'Quality education for all students', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'),
                ('Interactive Learning', 'Engaging classroom experiences', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80'),
                ('Expert Teachers', 'Qualified and experienced educators', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80')
            \`);
            message = 'Database initialized with sample data';
        }
        
        res.json({
            success: true,
            message: message,
            slideCount: count
        });
    } catch (error) {
        console.error('Database init error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUBLIC ROUTES

// Get all slides
app.get('/api/slides', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM slides ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching slides:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ADMIN ROUTES

// Admin authentication
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', { username });
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password required' 
            });
        }
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
});

// Get all slides (admin)
app.get('/api/admin/slides', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM slides ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching slides:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add new slide
app.post('/api/admin/slides', async (req, res) => {
    try {
        const { title, description, image_url } = req.body;
        
        if (!title || !image_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and image URL are required' 
            });
        }
        
        const result = await pool.query(
            'INSERT INTO slides (title, description, image_url) VALUES ($1, $2, $3) RETURNING *',
            [title, description || '', image_url]
        );
        
        res.json({
            success: true,
            slide: result.rows[0],
            message: 'Slide created successfully'
        });
    } catch (error) {
        console.error('Error creating slide:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create slide' 
        });
    }
});

// Delete slide
app.delete('/api/admin/slides/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('DELETE FROM slides WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Slide deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting slide:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete slide' 
        });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Malumbo Academy API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            testDb: '/api/test-db',
            initDb: '/api/init-db',
            slides: '/api/slides',
            adminLogin: '/api/admin/login'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(\`Malumbo Academy API running on port \${PORT}\`);
    console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});
