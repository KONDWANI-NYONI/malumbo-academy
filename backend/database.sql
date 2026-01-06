-- Create database
CREATE DATABASE malumbo_academy;

-- Connect to database
\c malumbo_academy;

-- Create users table for admin authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Insert default admin user (password: malumbo2023)
INSERT INTO users (username, password_hash, email) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin@malumboacademy.edu');

-- Create slides table for homepage slideshow
CREATE TABLE slides (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table for school events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    location VARCHAR(200),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery table for images
CREATE TABLE gallery (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(200),
    category VARCHAR(50) DEFAULT 'general',
    is_featured BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact_messages table
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO slides (image_url, title, description, display_order) VALUES
('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'Welcome to Malumbo Christian Academy', 'Providing quality Christian education since 2005', 1),
('https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4', 'Excellence in Education', 'Developing future leaders with strong moral foundations', 2),
('https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'State-of-the-Art Facilities', 'Modern learning environment for our students', 3);

INSERT INTO events (title, description, event_date, event_time, location) VALUES
('Graduation Ceremony', 'Annual graduation ceremony for our graduating class of 2023', '2023-06-30', '10:00 AM', 'School Auditorium'),
('Parent-Teacher Conferences', 'End-of-term meetings between parents and teachers', '2023-06-20', '8:00 AM - 5:00 PM', 'Classrooms'),
('Summer Camp Begins', 'Our annual summer enrichment program starts today', '2023-07-10', '9:00 AM - 3:00 PM', 'School Campus');

INSERT INTO gallery (image_url, caption, category) VALUES
('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'School Building', 'campus'),
('https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'Classroom', 'facilities'),
('https://images.unsplash.com/photo-1577896851231-70ef18881754', 'Science Lab', 'facilities'),
('https://images.unsplash.com/photo-1542744095-fcf48d80b0fd', 'Sports Day', 'activities');