
-- Drop tables if they exist (in reverse order of creation to avoid foreign key constraints)
DROP TABLE IF EXISTS expense_categories;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS income_categories;
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS family_members;

-- Create family_members table
CREATE TABLE family_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create income_categories table
CREATE TABLE income_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expense_categories table
CREATE TABLE expense_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create budgets table
CREATE TABLE budgets (
  id VARCHAR(36) PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  total_allocated DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (month, year)
);

-- Create budget_categories table
CREATE TABLE budget_categories (
  id VARCHAR(36) PRIMARY KEY,
  budget_id VARCHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL,
  allocated DECIMAL(10, 2) NOT NULL DEFAULT 0,
  spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  UNIQUE KEY (budget_id, category)
);

-- Create income table
CREATE TABLE income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  family_member_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Create expenses table
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  family_member_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL
);

-- Insert sample family members
INSERT INTO family_members (id, name, relation) VALUES 
('1', 'John Doe', 'Self'),
('2', 'Jane Doe', 'Spouse'),
('3', 'Jimmy Doe', 'Child');

-- Insert sample income categories
INSERT INTO income_categories (name) VALUES 
('Salary'),
('Freelance'),
('Investment'),
('Business'),
('Rental'),
('Other');

-- Insert sample expense categories
INSERT INTO expense_categories (name) VALUES 
('Housing'),
('Food'),
('Transportation'),
('Entertainment'),
('Healthcare'),
('Education'),
('Personal Care'),
('Utilities'),
('Savings'),
('Debt Payments'),
('Insurance'),
('Shopping'),
('Travel'),
('Gifts & Donations'),
('Miscellaneous');

-- Insert sample income records
INSERT INTO income (amount, category, date, description, family_member_id) VALUES 
(50000, 'Salary', '2023-05-01', 'May Salary', '1'),
(25000, 'Salary', '2023-05-01', 'Part-time job', '2'),
(10000, 'Freelance', '2023-05-10', 'Website development project', '1'),
(5000, 'Investment', '2023-05-15', 'Dividend income', '1'),
(8000, 'Rental', '2023-05-20', 'Apartment rent', '2'),
(45000, 'Salary', '2023-06-01', 'June Salary', '1'),
(25000, 'Salary', '2023-06-01', 'Part-time job', '2'),
(12000, 'Freelance', '2023-06-12', 'Logo design project', '1'),
(5500, 'Investment', '2023-06-15', 'Stock gain', '2'),
(8000, 'Rental', '2023-06-20', 'Apartment rent', '2');

-- Insert sample expense records
INSERT INTO expenses (amount, category, date, description, family_member_id) VALUES 
(15000, 'Housing', '2023-05-05', 'Rent payment', '1'),
(8000, 'Food', '2023-05-10', 'Monthly groceries', '2'),
(2500, 'Transportation', '2023-05-15', 'Fuel', '1'),
(4000, 'Entertainment', '2023-05-20', 'Movie and dinner', '2'),
(3000, 'Healthcare', '2023-05-25', 'Doctor visit', '3'),
(5000, 'Education', '2023-05-28', 'Online course', '1'),
(15000, 'Housing', '2023-06-05', 'Rent payment', '1'),
(8500, 'Food', '2023-06-12', 'Monthly groceries', '2'),
(3000, 'Transportation', '2023-06-15', 'Fuel', '1'),
(4500, 'Entertainment', '2023-06-22', 'Concert tickets', '2'),
(2000, 'Healthcare', '2023-06-28', 'Medicine', '3');

-- Insert sample budget for current month
INSERT INTO budgets (id, month, year, total_allocated) 
VALUES ('budget-2023-6', 6, 2023, 75000);

-- Insert sample budget categories
INSERT INTO budget_categories (id, budget_id, category, allocated, spent)
VALUES 
('bc-housing-2023-6', 'budget-2023-6', 'Housing', 20000, 15000),
('bc-food-2023-6', 'budget-2023-6', 'Food', 10000, 8500),
('bc-transportation-2023-6', 'budget-2023-6', 'Transportation', 5000, 3000),
('bc-entertainment-2023-6', 'budget-2023-6', 'Entertainment', 5000, 4500),
('bc-healthcare-2023-6', 'budget-2023-6', 'Healthcare', 3000, 2000),
('bc-education-2023-6', 'budget-2023-6', 'Education', 2000, 0),
('bc-utilities-2023-6', 'budget-2023-6', 'Utilities', 5000, 0),
('bc-personal-2023-6', 'budget-2023-6', 'Personal Care', 3000, 0),
('bc-savings-2023-6', 'budget-2023-6', 'Savings', 15000, 0),
('bc-other-2023-6', 'budget-2023-6', 'Miscellaneous', 7000, 0);

-- Update the totals in the budget
UPDATE budgets
SET total_spent = (SELECT SUM(spent) FROM budget_categories WHERE budget_id = 'budget-2023-6')
WHERE id = 'budget-2023-6';

-- Add current month's budget
INSERT INTO budgets (id, month, year, total_allocated) 
VALUES ('budget-2023-7', 7, 2023, 75000);

-- Insert current month's budget categories
INSERT INTO budget_categories (id, budget_id, category, allocated, spent)
VALUES 
('bc-housing-2023-7', 'budget-2023-7', 'Housing', 20000, 0),
('bc-food-2023-7', 'budget-2023-7', 'Food', 10000, 0),
('bc-transportation-2023-7', 'budget-2023-7', 'Transportation', 5000, 0),
('bc-entertainment-2023-7', 'budget-2023-7', 'Entertainment', 5000, 0),
('bc-healthcare-2023-7', 'budget-2023-7', 'Healthcare', 3000, 0),
('bc-education-2023-7', 'budget-2023-7', 'Education', 2000, 0),
('bc-utilities-2023-7', 'budget-2023-7', 'Utilities', 5000, 0),
('bc-personal-2023-7', 'budget-2023-7', 'Personal Care', 3000, 0),
('bc-savings-2023-7', 'budget-2023-7', 'Savings', 15000, 0),
('bc-other-2023-7', 'budget-2023-7', 'Miscellaneous', 7000, 0);
