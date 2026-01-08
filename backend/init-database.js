const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    console.log('Connected to SQLite database');
    
    // Create slides table
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
            console.error('Error creating table:', err);
        } else {
            console.log('Slides table created successfully');
            
            // Check if table has data
            db.get('SELECT COUNT(*) as count FROM slides', (err, row) => {
                if (err) {
                    console.error('Error counting slides:', err);
                } else if (row.count === 0) {
                    console.log('Inserting sample data...');
                    
                    const sampleSlides = [
                        ['Welcome to Malumbo Academy', 'Where innovation meets excellence in education', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80'],
                        ['Modern Learning Spaces', 'State-of-the-art facilities designed for optimal learning', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80'],
                        ['Expert Faculty', 'Learn from industry professionals and academic leaders', 'https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=1600&q=80']
                    ];
                    
                    const stmt = db.prepare('INSERT INTO slides (title, description, image_url) VALUES (?, ?, ?)');
                    
                    sampleSlides.forEach(slide => {
                        stmt.run(slide, (err) => {
                            if (err) {
                                console.error('Error inserting sample:', err);
                            }
                        });
                    });
                    
                    stmt.finalize();
                    console.log('Sample data inserted successfully');
                } else {
                    console.log(`Database already has ${row.count} slides`);
                }
                
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    } else {
                        console.log('Database connection closed');
                    }
                    process.exit(0);
                });
            });
        }
    });
});
