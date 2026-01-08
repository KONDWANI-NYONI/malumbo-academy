const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS slides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating slides table:', err);
        } else {
            console.log('✅ Slides table ready');
            // Insert sample data if table is empty
            db.get('SELECT COUNT(*) as count FROM slides', (err, row) => {
                if (err) {
                    console.error('Error counting slides:', err);
                } else if (row.count === 0) {
                    insertSampleSlides();
                }
            });
        }
    });
}

// Insert sample slides
function insertSampleSlides() {
    const sampleSlides = [
        {
            title: "Welcome to Malumbo Academy",
            description: "Where innovation meets excellence in education",
            image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80"
        },
        {
            title: "Modern Learning Spaces",
            description: "State-of-the-art facilities designed for optimal learning",
            image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
        },
        {
            title: "Expert Faculty",
            description: "Learn from industry professionals and academic leaders",
            image_url: "https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=1600&q=80"
        }
    ];

    const stmt = db.prepare('INSERT INTO slides (title, description, image_url) VALUES (?, ?, ?)');
    
    sampleSlides.forEach(slide => {
        stmt.run([slide.title, slide.description, slide.image_url], (err) => {
            if (err) {
                console.error('Error inserting sample slide:', err);
            }
        });
    });
    
    stmt.finalize();
    console.log('✅ Sample slides inserted');
}

// ========== PUBLIC ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM slides', (err, row) => {
        if (err) {
            res.status(500).json({
                status: 'ERROR',
                message: 'Database error'
            });
        } else {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Malumbo Academy API',
                version: '1.0.0',
                database: 'SQLite',
                slidesCount: row.count
            });
        }
    });
});

// Get all slides
app.get('/api/slides', (req, res) => {
    db.all('SELECT * FROM slides ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

// ========== ADMIN ROUTES ==========

// Admin login
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
    db.all('SELECT * FROM slides ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
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
    
    db.run(
        'INSERT INTO slides (title, description, image_url) VALUES (?, ?, ?)',
        [title, description || '', image_url],
        function(err) {
            if (err) {
                console.error('Error adding slide:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to add slide to database'
                });
            }
            
            // Get the newly inserted slide
            db.get('SELECT * FROM slides WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    console.error('Error fetching new slide:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Slide added but failed to retrieve'
                    });
                }
                
                res.json({
                    success: true,
                    slide: row,
                    message: 'Slide added successfully'
                });
            });
        }
    );
});

// Delete slide
app.delete('/api/admin/slides/:id', (req, res) => {
    const { id } = req.params;
    const slideId = parseInt(id);
    
    if (isNaN(slideId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid slide ID'
        });
    }
    
    db.run('DELETE FROM slides WHERE id = ?', [slideId], function(err) {
        if (err) {
            console.error('Error deleting slide:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete slide from database'
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Slide not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Slide deleted successfully',
            deletedId: slideId
        });
    });
});

// Database management endpoints
app.get('/api/init-db', (req, res) => {
    initDatabase();
    res.json({
        success: true,
        message: 'Database initialized'
    });
});

app.get('/api/reset-db', (req, res) => {
    db.run('DELETE FROM slides', (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to reset database'
            });
        }
        
        insertSampleSlides();
        res.json({
            success: true,
            message: 'Database reset with sample data'
        });
    });
});

// Serve frontend files
app.use(express.static('../frontend'));

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Malumbo Academy API running on port ${PORT}`);
    console.log(`💾 Using SQLite database for persistent storage`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Admin: http://localhost:${PORT}/admin.html`);
});
