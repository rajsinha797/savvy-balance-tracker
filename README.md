
# FinTrack - Finance Tracking App

## Features
- Track income and expenses
- Budget planning and monitoring
- Comprehensive financial reports
- Financial goals tracking

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

### Database Schema Setup

If you haven't set up the database yet, use this SQL to create the necessary tables:

```sql
-- family: Central entity for grouping users
CREATE TABLE family (
    family_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

-- user: Manages user details and authentication
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    family_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100)
);

-- income_category: Categories for income
CREATE TABLE income_category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- expense_category: Categories for expenses
CREATE TABLE expense_category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- income: Tracks income sources
CREATE TABLE income (
    income_id INT PRIMARY KEY AUTO_INCREMENT,
    family_id INT NOT NULL,
    user_id INT,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- expense: Tracks expenditures
CREATE TABLE expense (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    family_id INT NOT NULL,
    user_id INT,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data for categories
INSERT INTO income_category (name) VALUES 
('Salary'), ('Freelance'), ('Interest'), ('Dividend'), ('Gift'), ('Other');

INSERT INTO expense_category (name) VALUES 
('Housing'), ('Food'), ('Transportation'), ('Entertainment'), ('Healthcare'), ('Education'), ('Utilities'), ('Other');

-- Insert a sample family
INSERT INTO family (name) VALUES ('Default Family');

-- Insert a sample user (password is 'password' - implement proper hashing in production)
INSERT INTO user (family_id, name, username, password_hash, email) 
VALUES (1, 'Demo User', 'demo', 'password_hash_would_go_here', 'demo@example.com');
```

### API Endpoints

The API server provides the following endpoints:

- **GET /api/test** - Test database connection
- **GET /api/income/categories** - Get all income categories
- **GET /api/income** - Get all incomes
- **GET /api/income/:id** - Get income by ID
- **POST /api/income** - Add new income
- **PUT /api/income/:id** - Update income
- **DELETE /api/income/:id** - Delete income

## Automatic Fallback

The app is designed to automatically detect if the API server is running. If the API is unavailable, the app will seamlessly fall back to using dummy data, allowing for UI development and testing without a database connection.
