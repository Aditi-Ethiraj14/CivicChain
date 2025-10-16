-- CivicChain MySQL Database Setup Script
-- Run this script to set up MySQL database for production use

-- Create database
CREATE DATABASE IF NOT EXISTS civicchain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for the application
CREATE USER IF NOT EXISTS 'civicchain_user'@'localhost' IDENTIFIED BY 'civicchain_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON civicchain.* TO 'civicchain_user'@'localhost';

-- Grant privileges for remote access (if needed)
-- CREATE USER IF NOT EXISTS 'civicchain_user'@'%' IDENTIFIED BY 'civicchain_password';
-- GRANT ALL PRIVILEGES ON civicchain.* TO 'civicchain_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the database
USE civicchain;

-- Show database information
SELECT 'Database civicchain created successfully!' as status;
SELECT 'User civicchain_user created with full privileges' as status;

-- Optional: Create some indexes for better performance (these will be created automatically by Hibernate, but you can uncomment if needed)
/*
-- Indexes for better performance
ALTER TABLE users ADD INDEX idx_username (username);
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_created_at (created_at);

ALTER TABLE civic_issues ADD INDEX idx_reporter (reporter_id);
ALTER TABLE civic_issues ADD INDEX idx_status (status);
ALTER TABLE civic_issues ADD INDEX idx_type (type);
ALTER TABLE civic_issues ADD INDEX idx_priority (priority);
ALTER TABLE civic_issues ADD INDEX idx_created_at (created_at);
ALTER TABLE civic_issues ADD INDEX idx_location (latitude, longitude);

ALTER TABLE issue_validations ADD INDEX idx_user_issue (user_id, issue_id);
ALTER TABLE issue_validations ADD INDEX idx_created_at (created_at);

ALTER TABLE user_transactions ADD INDEX idx_user (user_id);
ALTER TABLE user_transactions ADD INDEX idx_type (type);
ALTER TABLE user_transactions ADD INDEX idx_created_at (created_at);
*/

-- Show tables (will be empty initially, tables will be created by Hibernate)
SHOW TABLES;

-- Instructions for switching to MySQL
-- 1. Run this script in MySQL: mysql -u root -p < setup-mysql.sql
-- 2. In application.yml, comment out H2 config and uncomment MySQL config
-- 3. Restart the application

SELECT 'Setup complete! Follow the instructions in application.yml to switch to MySQL.' as next_steps;