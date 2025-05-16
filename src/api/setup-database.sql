
-- This SQL file sets up the FinTrack database schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fintrack;
USE fintrack;

-- Create user table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create family table
CREATE TABLE IF NOT EXISTS family (
    family_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default family
INSERT INTO family (name) VALUES ('Default Family') ON DUPLICATE KEY UPDATE name = name;

-- Create family members table
CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES family(family_id) ON DELETE CASCADE
);

-- Add some default family members
INSERT INTO family_members (family_id, name, relationship, is_default) 
VALUES 
    (1, 'Self', 'Self', TRUE),
    (1, 'Spouse', 'Spouse', FALSE),
    (1, 'Child', 'Child', FALSE)
ON DUPLICATE KEY UPDATE name = name;

-- Create income category table
CREATE TABLE IF NOT EXISTS income_category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some default income categories
INSERT INTO income_category (name) VALUES 
    ('Salary'), 
    ('Freelance'), 
    ('Business'), 
    ('Investments'), 
    ('Rental'), 
    ('Other')
ON DUPLICATE KEY UPDATE name = name;

-- Create income table
CREATE TABLE IF NOT EXISTS income (
    income_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    family_member_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES family(family_id),
    FOREIGN KEY (category_id) REFERENCES income_category(category_id),
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add default expense categories
INSERT INTO expense_categories (name) VALUES 
    ('Housing'),
    ('Utilities'),
    ('Groceries'),
    ('Transportation'),
    ('Entertainment'),
    ('Health'),
    ('Personal Care'),
    ('Education'),
    ('Debt Payments'),
    ('Insurance'),
    ('Savings'),
    ('Investments'),
    ('Charity'),
    ('Other')
ON DUPLICATE KEY UPDATE name = name;

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    family_member_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES family(family_id),
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(36) PRIMARY KEY,
    month VARCHAR(2) NOT NULL,
    year VARCHAR(4) NOT NULL,
    total_allocated DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id VARCHAR(36) PRIMARY KEY,
    budget_id VARCHAR(36) NOT NULL,
    category VARCHAR(50) NOT NULL,
    allocated DECIMAL(10,2) DEFAULT 0.00,
    spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Create financial goals table
CREATE TABLE IF NOT EXISTS financial_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    category VARCHAR(50),
    status ENUM('In Progress', 'Achieved', 'Cancelled') DEFAULT 'In Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES family(family_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_family ON income(family_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_family ON expenses(family_id);
CREATE INDEX idx_budget_month_year ON budgets(month, year);
