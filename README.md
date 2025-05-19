
# FinTrack - Personal Finance Tracker

FinTrack is a comprehensive personal finance tracking application that helps users manage their incomes, expenses, budgets, and wallets.

## Features

- **Dashboard**: Get an overview of your financial situation with visual charts and recent transactions
- **Family Management**: Add and manage family members to track finances jointly
- **Wallet Management**: Create different types of wallets (Spending, Savings, Debt) with categories and sub-categories
- **Income Tracking**: Record and categorize income from different sources
- **Expense Tracking**: Keep track of all your expenses with detailed categorization
- **Budget Planning**: Set and monitor monthly budgets across various expense categories
- **Reports**: Generate comprehensive financial reports

## Database Setup

The application requires a MySQL database with the following setup:

1. Create a database named `fintrack`
2. Run the provided `setup-database.sql` script to create all required tables and initial data

```sql
-- Sample of the database schema
CREATE TABLE family (
  family_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- See setup-database.sql for full schema
```

## Wallet System

The wallet system allows tracking of different types of finances:

- **Spending Wallets**: Cash, Credit cards, Digital wallets
- **Savings Wallets**: Emergency funds, Trip savings, House savings
- **Debt Wallets**: Loans, Personal debt, Car loans

Expenses can be linked to specific wallets to track where money is being spent from, and income can be linked to wallets to track where money is being deposited.

## API Structure

- `/api/family-members` - Family member management
- `/api/income` - Income tracking and categorization
- `/api/expenses` - Expense tracking and categorization
- `/api/wallet` - Wallet management
- `/api/budgets` - Budget planning and tracking
- `/api/reports` - Financial reports and analytics

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: Tailwind CSS and shadcn/ui
- **State Management**: React Query
- **Backend**: Express.js
- **Database**: MySQL

## Getting Started

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Setup the database (see Database Setup section)
4. Start the frontend development server:
   ```
   npm run dev
   ```
5. Start the backend server:
   ```
   cd src/api
   npm install
   npm start
   ```

## Environment Variables

Create a `.env` file with the following configurations:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fintrack
PORT=3001
```

## License

MIT License
