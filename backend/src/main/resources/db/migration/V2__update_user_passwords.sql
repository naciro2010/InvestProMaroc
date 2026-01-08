-- ========================================================================================================
-- V2__update_user_passwords.sql
-- Update all test user passwords with correct BCrypt hashes
-- ========================================================================================================

-- Update passwords with correct BCrypt hashes
-- Passwords: admin123, manager123, analyst123, controller123, user123, supervisor123

UPDATE users SET password = '$2a$10$FgV/HQfVz2nhjZVui0gU/.6Kdn5d2anD7NB0yqNWf8ElzCAd4cpzO' WHERE username = 'admin';
UPDATE users SET password = '$2a$10$1Q./zo4UGte0GyBOVKAR3eKeZfVmjBGSuwYp5XMeUv8P/I4sUH1iK' WHERE username = 'manager';
UPDATE users SET password = '$2a$10$el8RCQGmATDGNnoLP7Tbf.mh5L9UZcqe1JQshc6WyQlWDlznXl5ky' WHERE username = 'analyst';
UPDATE users SET password = '$2a$10$DlZlfPKHcCzL51qX1az4Le0x41VwDFobaw6lGUfOho1BMakHljqri' WHERE username = 'controller';
UPDATE users SET password = '$2a$10$d1zJGQQEcX1nHSHSIn8xR.iCV7h4oZN4eBXJyKYkRpRJBRsKgtAG.' WHERE username = 'user';
UPDATE users SET password = '$2a$10$C7PaMNSiBFWuMSBHO6cd3ezHukNMi0dsCDhzsSkstHiq.3un8mKyC' WHERE username = 'supervisor';

-- Verify the updates (optional - for logging)
-- SELECT username, email FROM users WHERE username IN ('admin', 'manager', 'analyst', 'controller', 'user', 'supervisor');

-- ========================================================================================================
-- END OF MIGRATION
-- ========================================================================================================
