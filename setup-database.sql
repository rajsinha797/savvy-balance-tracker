
-- Create family table if it doesn't exist
CREATE TABLE IF NOT EXISTS family (
  family_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create family members table if it doesn't exist
CREATE TABLE IF NOT EXISTS family_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wallet tables
CREATE TABLE IF NOT EXISTS wallet_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  is_expense TINYINT(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_type_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_sub_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_category_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  wallet_type_id INT,
  wallet_category_id INT,
  wallet_sub_category_id INT,
  date DATE NOT NULL,
  description TEXT,
  family_member_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add wallet_id to income table if it doesn't exist
ALTER TABLE income ADD COLUMN IF NOT EXISTS wallet_id INT NULL;

-- Add wallet_id to expenses table if it doesn't exist
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS wallet_id INT NULL;

-- Insert default wallet types if they don't exist
INSERT IGNORE INTO wallet_type (id, name, is_expense) VALUES
  (1, 'Spending', 1),
  (2, 'Savings', 0),
  (3, 'Debt', 1);

-- Insert default wallet categories if they don't exist
INSERT IGNORE INTO wallet_category (wallet_type_id, name) VALUES
  (1, 'Cash'),
  (1, 'Credit'),
  (1, 'Digital'),
  (1, 'Custom'),
  (2, 'Emergency Fund'),
  (2, 'Trip'),
  (2, 'House'),
  (2, 'Custom'),
  (3, 'Loan'),
  (3, 'Personal Debt'),
  (3, 'Car Loan'),
  (3, 'Custom');

-- Insert default wallet subcategories if they don't exist
INSERT IGNORE INTO wallet_sub_category (wallet_category_id, name) VALUES
  (1, 'Cash at Home'),
  (1, 'Wallet Cash'),
  (2, 'Credit Card'),
  (2, 'Store Credit'),
  (3, 'Paytm'),
  (3, 'PhonePe'),
  (3, 'Google Pay'),
  (9, 'Home Loan'),
  (10, 'Friend Loan'),
  (11, 'Car EMI');

-- Insert default family if it doesn't exist
INSERT IGNORE INTO family (family_id, name) VALUES (1, 'Default Family');

-- Insert default family members if they don't exist
INSERT IGNORE INTO family_members (family_id, name, relationship, is_default) VALUES 
  (1, 'Self', 'Self', 1),
  (1, 'Spouse', 'Spouse', 0),
  (1, 'Child', 'Child', 0);
