-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(100),
    verification_token_expiry TIMESTAMP,
    reset_password_token VARCHAR(100),
    reset_password_token_expiry TIMESTAMP,
    two_factor_secret VARCHAR(100),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id BIGINT PRIMARY KEY,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    activity_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    api_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_MODERATOR') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;

-- Drop function if it exists
-- DROP FUNCTION IF EXISTS update_modified_column CASCADE;

-- Create a function to update the updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_modified_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Drop trigger if it exists
-- DROP TRIGGER IF EXISTS update_users_modtime ON users;

-- Create a trigger to automatically update the updated_at column
-- CREATE TRIGGER update_users_modtime
-- BEFORE UPDATE ON users
-- FOR EACH ROW
-- EXECUTE FUNCTION update_modified_column();

-- Drop views if they exist before recreating them
DROP VIEW IF EXISTS user_profiles;
DROP VIEW IF EXISTS recent_user_activities;

-- Create a view for user profile information
CREATE VIEW user_profiles AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.email_verified,
    u.two_factor_enabled,
    u.enabled,
    string_agg(r.name, ', ') as roles,
    up.theme,
    up.language
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.id
LEFT JOIN 
    user_preferences up ON u.id = up.user_id
GROUP BY 
    u.id, up.theme, up.language;

-- Create a view for recent user activities
CREATE VIEW recent_user_activities AS
SELECT 
    ua.user_id,
    u.username,
    ua.activity_type,
    ua.description,
    ua.timestamp,
    ua.ip_address
FROM 
    user_activities ua
JOIN 
    users u ON ua.user_id = u.id
WHERE 
    ua.timestamp > (CURRENT_TIMESTAMP - INTERVAL '30 days')
ORDER BY 
    ua.timestamp DESC;