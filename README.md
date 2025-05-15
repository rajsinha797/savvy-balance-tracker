
# FinTrack - Finance Tracking App

FinTrack is a comprehensive financial tracking application designed to help individuals and families manage their personal finances. The application allows users to track income, expenses, plan budgets, and generate financial reports.

## Features
- Track income and expenses for multiple family members
- Filter transactions by family member
- Track income sources and categories
- Budget planning and monitoring
- Comprehensive financial reports
- Financial goals tracking

## Screenshot
![FinTrack Screenshot](public/screenshot.png)

## API Server Setup

The app can work in two modes:
1. **Standalone Mode:** Uses dummy data without a backend connection
2. **Connected Mode:** Connects to a MySQL database for full functionality

### Prerequisites for Connected Mode
- MySQL server running locally
- Database named `fintrack` created with the provided schema
- Node.js installed to run the API server

### Starting the API Server

1. In a separate terminal, navigate to the project directory
2. Run the API server with:
```bash
node src/api/start-server.js
```
3. The server will run on port 3001 by default
4. The app UI runs on port 8080 (or another port specified by your dev server)

### Database Schema Setup

The schema includes tables for family, family members, income categories, income transactions, and expenses. It's designed to support tracking finances for multiple family members.

```sql
-- Create fintrack database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fintrack;

USE fintrack;

-- Create family table
CREATE TABLE IF NOT EXISTS family (
  family_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id)
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id INT NOT NULL AUTO_INCREMENT,
  family_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (family_id) REFERENCES family(family_id)
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
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  FOREIGN KEY (family_id) REFERENCES family(family_id)
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
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
  FOREIGN KEY (family_id) REFERENCES family(family_id)
);

-- Insert sample income categories
INSERT INTO income_category (name) VALUES 
('Salary'), ('Freelance'), ('Investment'), ('Rental'), ('Other');

-- Insert default family if table is empty
INSERT INTO family (name)
SELECT 'Default Family' FROM DUAL WHERE NOT EXISTS (SELECT * FROM family);

-- Insert default family member
INSERT INTO family_members (family_id, name, relationship, is_default)
SELECT 1, 'Self', 'Self', 1 FROM DUAL WHERE NOT EXISTS (SELECT * FROM family_members WHERE name = 'Self');
```

## Automatic Fallback

The app is designed to automatically detect if the API server is running. If the API is unavailable, the app will seamlessly fall back to using dummy data, allowing for UI development and testing without a database connection.

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Tailwind CSS for styling
  - shadcn/ui component library
  - Tanstack React Query for data fetching
  - React Router for navigation

- **Backend**:
  - Node.js with Express
  - MySQL database
  - RESTful API design

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. In a separate terminal, start the API server with `node src/api/start-server.js`

## License

MIT
