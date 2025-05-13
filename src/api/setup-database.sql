
-- Create fintrack database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fintrack;

USE fintrack;

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id INT NOT NULL AUTO_INCREMENT,
  family_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Create income_category table
CREATE TABLE IF NOT EXISTS income_category (
  category_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  PRIMARY KEY (category_id)
);

-- Create income table with family_member_id
CREATE TABLE IF NOT EXISTS income (
  income_id INT NOT NULL AUTO_INCREMENT,
  family_id INT NOT NULL,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  family_member_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (income_id),
  FOREIGN KEY (category_id) REFERENCES income_category(category_id),
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Create expenses table with family_member_id
CREATE TABLE IF NOT EXISTS expenses (
  expense_id INT NOT NULL AUTO_INCREMENT,
  family_id INT NOT NULL,
  user_id INT NOT NULL,
  family_member_id INT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (expense_id),
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Insert sample income categories if table is empty
INSERT INTO income_category (name) 
SELECT 'Salary' FROM DUAL WHERE NOT EXISTS (SELECT * FROM income_category WHERE name = 'Salary');

INSERT INTO income_category (name) 
SELECT 'Freelance' FROM DUAL WHERE NOT EXISTS (SELECT * FROM income_category WHERE name = 'Freelance');

INSERT INTO income_category (name) 
SELECT 'Investment' FROM DUAL WHERE NOT EXISTS (SELECT * FROM income_category WHERE name = 'Investment');

INSERT INTO income_category (name) 
SELECT 'Rental' FROM DUAL WHERE NOT EXISTS (SELECT * FROM income_category WHERE name = 'Rental');

INSERT INTO income_category (name) 
SELECT 'Other' FROM DUAL WHERE NOT EXISTS (SELECT * FROM income_category WHERE name = 'Other');

-- Insert default family member
INSERT INTO family_members (family_id, name, relationship, is_default)
SELECT 1, 'Self', 'Self', 1 FROM DUAL WHERE NOT EXISTS (SELECT * FROM family_members WHERE name = 'Self');
