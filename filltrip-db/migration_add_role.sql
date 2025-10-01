-- Migration script to add role column and admin user
-- Run this on your existing filltrip database

-- Add role column to user table with default value 'user'
ALTER TABLE `user` 
ADD COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user' 
AFTER `user_icon`;

-- Update existing users to have 'user' role (this is redundant due to default but ensures consistency)
UPDATE `user` SET `role` = 'user' WHERE `role` IS NULL OR `role` = '';

-- Insert Admin User (password = "password")
-- Make sure to use the next available ID (adjust if needed)
INSERT INTO `user`
(first_name, last_name, full_name, username, email, password_hash, user_icon, role, created_at)
VALUES
(
  'Admin',
  'Test',
  'Admin Test',
  'admin',
  'admin@gmail.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for "password"
  NULL,
  'admin',
  NOW()
);

-- Verify the changes
SELECT id, username, email, role, created_at FROM `user` ORDER BY id;