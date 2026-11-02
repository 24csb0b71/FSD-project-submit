-- ==========================================================
-- DigiVote: PostgreSQL Schema & Dummy Data Setup Script
-- Database: digivote
-- ==========================================================

-- 1. Create database (Execute if database does not exist):
-- CREATE DATABASE digivote;
-- \c digivote;

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS vote CASCADE;
DROP TABLE IF EXISTS candidate CASCADE;
DROP TABLE IF EXISTS position CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS election_config CASCADE;

-- ----------------------------------------------------------
-- Table 1: student
-- Passwords are encrypted with BCrypt
-- Default password for all sample accounts is: Password@123
-- Admin password is: Admin@12345
-- ----------------------------------------------------------
CREATE TABLE student (
    student_id VARCHAR(20) PRIMARY KEY,
    s_name VARCHAR(100) NOT NULL,
    email_id VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- ----------------------------------------------------------
-- Table 2: position
-- Available student body representation roles
-- ----------------------------------------------------------
CREATE TABLE position (
    position_id INT PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL
);

-- ----------------------------------------------------------
-- Table 3: candidate
-- Nominated candidates for election positions
-- approved statuses: 'APPROVED', 'PENDING', 'DISAPPROVED'
-- ----------------------------------------------------------
CREATE TABLE candidate (
    candidateid SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    positionid INT NOT NULL REFERENCES position(position_id) ON DELETE CASCADE,
    manifesto TEXT NOT NULL,
    img_src TEXT NOT NULL,
    approved VARCHAR(20) DEFAULT 'PENDING'
);

-- ----------------------------------------------------------
-- Table 4: vote
-- Secret ballot record: (voter_id, position_id) is composite PK
-- Enforces one vote per voter per position
-- ----------------------------------------------------------
CREATE TABLE vote (
    voter_id VARCHAR(20) NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    position_id INT NOT NULL REFERENCES position(position_id) ON DELETE CASCADE,
    candidate_id INT NOT NULL REFERENCES candidate(candidateid) ON DELETE CASCADE,
    PRIMARY KEY (voter_id, position_id)
);

-- ----------------------------------------------------------
-- Table 5: election_config
-- Global election scheduler configuration
-- statuses: 'NOT_STARTED', 'ACTIVE', 'CLOSED'
-- ----------------------------------------------------------
CREATE TABLE election_config (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- ==========================================================
-- DUMMY DATA INSERTIONS
-- ==========================================================

-- Hash for "Admin@12345": $2a$10$UcxlCSQGXADRxhsBc0zpVuD3F2kbH5tLPRIis4kiNGUF3BDEIBi4G
-- Hash for "Password@123": $2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW

-- Insert Students (Including Admin and Registered Voters)
INSERT INTO student (student_id, s_name, email_id, password, is_admin) VALUES
('20ADM0A01', 'Chief Election Admin', '20adm0a01@student.nitw.ac.in', '$2a$10$UcxlCSQGXADRxhsBc0zpVuD3F2kbH5tLPRIis4kiNGUF3BDEIBi4G', TRUE),
('22CSB0A01', 'Siddanth Sarath',      '22csb0a01@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', TRUE),
('22CSB0A02', 'Aarav Sharma',         '22csb0a02@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('22ECB0A03', 'Priya Patel',          '22ecb0a03@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('22MEB0B04', 'Rohan Verma',          '22meb0b04@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('21EEB0A05', 'Ananya Rao',           '21eeb0a05@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('21CSB0A06', 'Karthik Nair',         '21csb0a06@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('23CEB0B07', 'Sneha Reddy',          '23ceb0b07@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE),
('23CHB0A08', 'Vikram Malhotra',      '23chb0a08@student.nitw.ac.in', '$2a$10$09d7wi9LrQUdHR8H9BqRderIVH4fUdBLZeI4Ne57OzHDeYo3nwByW', FALSE);

-- Insert Positions
INSERT INTO position (position_id, position_name) VALUES
(1, 'President'),
(2, 'Vice President'),
(3, 'General Secretary'),
(4, 'Cultural Secretary'),
(5, 'Sports Secretary');

-- Insert Candidates (5 Approved, 1 Pending for Admin review)
INSERT INTO candidate (candidateid, student_id, positionid, manifesto, img_src, approved) VALUES
(1, '22CSB0A02', 1, 'Promote hackathons, transparent council budget allocation, and round-the-clock library access.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300', 'APPROVED'),
(2, '22ECB0A03', 1, 'Advocate for modern lab facilities, student mental health initiatives, and alumni mentorship programs.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', 'APPROVED'),
(3, '22MEB0B04', 2, 'Revamp hostel amenities, improve mess food quality feedback loops, and sponsor inter-college events.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'APPROVED'),
(4, '21EEB0A05', 2, 'Upgrade campus-wide high-speed Wi-Fi, promote green energy campus initiatives, and career workshops.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300', 'APPROVED'),
(5, '21CSB0A06', 3, 'Ensure timely publication of council meeting minutes, transparent clubs registry, and grievance resolution.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', 'APPROVED'),
(6, '23CEB0B07', 4, 'Expand annual cultural fest with nationwide student competitions and guest artist performances.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', 'PENDING');

-- Reset candidate sequence so new registrations increment from 7 onwards
SELECT setval(pg_get_serial_sequence('candidate', 'candidateid'), 6);

-- Insert Votes to demonstrate live Turnout & Results analytics
-- Aarav Sharma (cand 1) vs Priya Patel (cand 2) for President (pos 1)
-- Rohan Verma (cand 3) vs Ananya Rao (cand 4) for Vice President (pos 2)
-- Karthik Nair (cand 5) for General Secretary (pos 3)
INSERT INTO vote (voter_id, position_id, candidate_id) VALUES
('22CSB0A01', 1, 1),
('22CSB0A01', 2, 3),
('22CSB0A01', 3, 5),

('22CSB0A02', 1, 1),
('22CSB0A02', 2, 4),
('22CSB0A02', 3, 5),

('22ECB0A03', 1, 2),
('22ECB0A03', 2, 4),
('22ECB0A03', 3, 5),

('22MEB0B04', 1, 2),
('22MEB0B04', 2, 3),

('21EEB0A05', 1, 2),
('21EEB0A05', 2, 4),
('21EEB0A05', 3, 5),

('21CSB0A06', 1, 1),
('21CSB0A06', 2, 3),
('21CSB0A06', 3, 5);

-- Insert Default Active Election Config (Current window open for voting)
INSERT INTO election_config (id, start_time, end_time, status) VALUES
(1, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '24 hours', 'ACTIVE');

-- Reset election_config sequence
SELECT setval(pg_get_serial_sequence('election_config', 'id'), 1);
