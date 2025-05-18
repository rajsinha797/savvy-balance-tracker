
-- Drop tables if they exist (in reverse order of creation to avoid foreign key constraints)
DROP TABLE IF EXISTS expense_sub_category;
DROP TABLE IF EXISTS expense_category;
DROP TABLE IF EXISTS expense_type;
DROP TABLE IF EXISTS income_sub_category;
DROP TABLE IF EXISTS income_category;
DROP TABLE IF EXISTS income_type;
DROP TABLE IF EXISTS expense_categories;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS income_categories;
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS family;

-- Create family table
CREATE TABLE family (
  family_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create family_members table
CREATE TABLE family_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- New income categorization tables
CREATE TABLE income_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE income_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    income_type_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_type_id) REFERENCES income_type(id) ON DELETE CASCADE
);

CREATE TABLE income_sub_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    income_category_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_category_id) REFERENCES income_category(id) ON DELETE CASCADE
);

-- New expense categorization tables
CREATE TABLE expense_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_type_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_type_id) REFERENCES expense_type(id) ON DELETE CASCADE
);

CREATE TABLE expense_sub_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_category_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_category_id) REFERENCES expense_category(id) ON DELETE CASCADE
);

-- Legacy tables that will be kept for backward compatibility
CREATE TABLE income_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
  type VARCHAR(50) NULL,
  sub_category VARCHAR(50) NULL,
  allocated DECIMAL(10, 2) NOT NULL DEFAULT 0,
  spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  UNIQUE KEY (budget_id, category, type, sub_category)
);

-- Create income table with the new categorization fields
CREATE TABLE income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  income_type_id INT,
  income_category_id INT,
  income_sub_category_id INT,
  category VARCHAR(100) DEFAULT 'Income',
  date DATE NOT NULL,
  description TEXT,
  family_member_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  FOREIGN KEY (income_type_id) REFERENCES income_type(id) ON DELETE SET NULL,
  FOREIGN KEY (income_category_id) REFERENCES income_category(id) ON DELETE SET NULL,
  FOREIGN KEY (income_sub_category_id) REFERENCES income_sub_category(id) ON DELETE SET NULL
);

-- Create expenses table with the new categorization fields
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  expense_type_id INT,
  expense_category_id INT,
  expense_sub_category_id INT,
  category VARCHAR(100) DEFAULT 'Expense',
  date DATE NOT NULL,
  description TEXT,
  family_member_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  FOREIGN KEY (expense_type_id) REFERENCES expense_type(id) ON DELETE SET NULL,
  FOREIGN KEY (expense_category_id) REFERENCES expense_category(id) ON DELETE SET NULL,
  FOREIGN KEY (expense_sub_category_id) REFERENCES expense_sub_category(id) ON DELETE SET NULL
);

-- Insert default family
INSERT INTO family (family_id, name) VALUES (1, 'Default Family');

-- Insert sample family members
INSERT INTO family_members (id, name, relation) VALUES 
('1', 'John Doe', 'Self'),
('2', 'Jane Doe', 'Spouse'),
('3', 'Jimmy Doe', 'Child');

-- Insert income types
INSERT INTO income_type (id, name) VALUES 
(1, 'Income'), 
(2, 'Savings'), 
(3, 'Investments')
ON DUPLICATE KEY UPDATE name = name;

-- Insert income categories
INSERT INTO income_category (id, income_type_id, name) VALUES 
(1, 1, 'Salary'), 
(2, 1, 'Meal Card'), 
(3, 2, 'Savings'), 
(4, 3, 'Mutual Funds'), 
(5, 3, 'PPF'), 
(6, 3, 'NPS')
ON DUPLICATE KEY UPDATE name = name;

-- Insert income subcategories
INSERT INTO income_sub_category (id, income_category_id, name) VALUES 
(1, 1, 'Prateek Salary'), 
(2, 1, 'Sunaina Salary'), 
(3, 3, 'Savings'), 
(4, 4, 'SBI'), 
(5, 5, 'PPF'), 
(6, 6, 'NPS')
ON DUPLICATE KEY UPDATE name = name;

-- Insert expense types
INSERT INTO expense_type (id, name) VALUES 
(1, 'Housing'), 
(2, 'Transportation'), 
(3, 'Food')
ON DUPLICATE KEY UPDATE name = name;

-- Insert expense categories
INSERT INTO expense_category (id, expense_type_id, name) VALUES 
(1, 1, 'Rent/Mortgage'), 
(2, 1, 'Utilities'), 
(3, 2, 'Fuel/Gasoline'), 
(4, 2, 'Vehicle Maintenance/Repairs'), 
(5, 3, 'Groceries'), 
(6, 3, 'Dining Out')
ON DUPLICATE KEY UPDATE name = name;

-- Insert expense subcategories
INSERT INTO expense_sub_category (id, expense_category_id, name) VALUES 
(1, 1, 'Home Loan'), 
(2, 1, 'Maintenance'), 
(3, 2, 'Electricity bill'), 
(4, 2, 'Water bill'), 
(5, 3, 'Two wheeler fuel'), 
(6, 4, 'Two Wheelers - Service/Repairs'), 
(7, 5, 'Groceries (Vegetables/Fruits)'), 
(8, 6, 'Restaurants/Cafe')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample income categories (legacy)
INSERT INTO income_categories (name) VALUES 
('Salary'),
('Freelance'),
('Investment'),
('Business'),
('Rental'),
('Other');

-- Insert sample expense categories (legacy)
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
INSERT INTO income (amount, income_type_id, income_category_id, income_sub_category_id, category, date, description, family_member_id) VALUES 
(50000, 1, 1, 1, 'Salary', '2023-05-01', 'May Salary', '1'),
(25000, 1, 1, 2, 'Salary', '2023-05-01', 'Part-time job', '2'),
(10000, 1, 1, 1, 'Salary', '2023-05-10', 'Website development project', '1'),
(5000, 3, 4, 4, 'Investment', '2023-05-15', 'Dividend income', '1'),
(8000, 1, 1, 2, 'Salary', '2023-05-20', 'Apartment rent', '2');

-- Insert sample expenses
INSERT INTO expenses (amount, expense_type_id, expense_category_id, expense_sub_category_id, category, date, description, family_member_id) VALUES
(15000, 1, 1, 1, 'Housing', '2023-05-05', 'May rent', '1'),
(3500, 1, 2, 3, 'Utilities', '2023-05-10', 'Electricity bill', '2'),
(1200, 2, 3, 5, 'Transportation', '2023-05-15', 'Petrol', '1'),
(2500, 3, 5, 7, 'Food', '2023-05-18', 'Weekly groceries', '2'),
(1800, 3, 6, 8, 'Food', '2023-05-20', 'Dinner at restaurant', '1');
