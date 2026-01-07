-- Initialize Malumbo Academy Database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, password_hash, email) 
VALUES ('admin', 'malumbo2023', 'admin@malumboacademy.edu')
ON CONFLICT (username) DO NOTHING;

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample slides
INSERT INTO slides (image_url, title, description, display_order) VALUES
('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'Welcome to Malumbo Christian Academy', 'Providing quality Christian education since 2005', 1),
('https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4', 'Excellence in Education', 'Developing future leaders with strong moral foundations', 2),
('https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'State-of-the-Art Facilities', 'Modern learning environment for our students', 3)
ON CONFLICT DO NOTHING;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    location VARCHAR(200),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample events
INSERT INTO events (title, description, event_date, event_time, location) VALUES
('Graduation Ceremony 2024', 'Annual graduation ceremony for our graduating class', '2024-06-30', '10:00 AM', 'School Auditorium'),
('Parent-Teacher Conferences', 'End-of-term meetings between parents and teachers', '2024-06-20', '8:00 AM - 5:00 PM', 'Classrooms'),
('Summer Camp Registration', 'Registration opens for summer enrichment program', '2024-05-15', '9:00 AM - 3:00 PM', 'Administration Office')
ON CONFLICT DO NOTHING;

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    category VARCHAR(50) DEFAULT 'general',
    is_featured BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample gallery images
INSERT INTO gallery (image_url, caption, category) VALUES
('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'School Building', 'campus'),
('https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'Classroom Learning', 'facilities'),
('https://images.unsplash.com/photo-1577896851231-70ef18881754', 'Science Laboratory', 'facilities'),
('https://images.unsplash.com/photo-1542744095-fcf48d80b0fd', 'Sports Activities', 'activities')
ON CONFLICT DO NOTHING;

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Show confirmation
SELECT 'Database initialized successfully!' as message;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
