
# FinTrack API Setup and Usage Guide

## Prerequisites

- Node.js (version 16 or later recommended)
- MySQL server running locally
- Database named `fintrack` created with the required schema

## Setting up the API server

1. Make sure your MySQL server is running and the `fintrack` database is created.

2. Configure the database connection in `src/api/db/db.js` (if your MySQL configuration differs from the defaults):
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root', // Change if using a different MySQL user
     password: '', // Add your MySQL password if any
     database: 'fintrack',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });
   ```

3. Initialize your database with the required schema:
   ```sql
   -- Use the SQL commands from setup-database.sql or run:
   mysql -u root fintrack < src/api/setup-database.sql
   ```

## Running the API Server

Run the API server using:

```bash
node src/api/start-server.js
```

The server will start on port 3001 by default. You should see:
```
Starting FinTrack API Server...
Press Ctrl+C to stop the server
```

## Troubleshooting

### Common Issues

#### Database Connection Problems
- Verify MySQL is running (`mysql --version`)
- Check database credentials in db.js
- Confirm the database exists (`mysql -u root -e "SHOW DATABASES;"`)
- Test the connection: `curl http://localhost:3001/api/test`

#### CORS Issues
If you're experiencing CORS issues, check the CORS configuration in `src/api/server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Add additional origins if your frontend is running on a different port.

## API Endpoints

### Base URL: `http://localhost:3001`

### Test Connection
- `GET /api/test` - Test database connection

### Income Endpoints
- `GET /api/income` - Get all incomes
- `GET /api/income/:id` - Get income by ID
- `POST /api/income` - Add new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### New Income Categorization Endpoints
- `GET /api/income/types` - Get all income types
- `GET /api/income/categories/by-type/:typeId` - Get income categories by type ID
- `GET /api/income/subcategories/by-category/:categoryId` - Get income subcategories by category ID

### Expense Endpoints
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### New Expense Categorization Endpoints
- `GET /api/expenses/types` - Get all expense types
- `GET /api/expenses/categories/by-type/:typeId` - Get expense categories by type ID
- `GET /api/expenses/subcategories/by-category/:categoryId` - Get expense subcategories by category ID

### Family Endpoints
- `GET /api/families` - Get all families
- `GET /api/families/:id` - Get family by ID
- `POST /api/families` - Add a new family
- `PUT /api/families/:id` - Update family
- `DELETE /api/families/:id` - Delete family

### Family Members Endpoints
- `GET /api/family/members` - Get all family members
- `GET /api/family/members/:id` - Get family member by ID
- `POST /api/family/members` - Add a new family member
- `PUT /api/family/members/:id` - Update family member
- `DELETE /api/family/members/:id` - Delete family member

### Reports Endpoints
- `GET /api/reports/monthly` - Get monthly income/expense summaries
- `GET /api/reports/weekly` - Get weekly spending patterns

## Database Schema

### New Categorization System

The new schema uses a hierarchical categorization system for both income and expenses:

#### Income Categorization
- `income_type` - Top level categorization (e.g., Income, Savings, Investments)
- `income_category` - Mid-level categorization related to a specific type
- `income_sub_category` - Detailed categorization related to a specific category

#### Expense Categorization
- `expense_type` - Top level categorization (e.g., Housing, Transportation, Food)
- `expense_category` - Mid-level categorization related to a specific type
- `expense_sub_category` - Detailed categorization related to a specific category

### Core Tables
- `family_members` - Family member details
- `income` - Income transactions with categorization
- `expenses` - Expense transactions with categorization
- `budgets` - Budget periods
- `budget_categories` - Budget allocation by category

For the complete schema, see `src/api/setup-database.sql`

## Testing the API

You can test the API endpoints using cURL or Postman. Here are some examples:

### Test Connection
```bash
curl http://localhost:3001/api/test
```

### Get All Expense Types
```bash
curl http://localhost:3001/api/expenses/types
```

### Get Expense Categories By Type
```bash
curl http://localhost:3001/api/expenses/categories/by-type/1
```

### Get Expense Subcategories By Category
```bash
curl http://localhost:3001/api/expenses/subcategories/by-category/1
```

### Add a New Expense
```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "expense_type_id": 1,
    "expense_category_id": 2,
    "expense_sub_category_id": 3,
    "date": "2023-05-10",
    "description": "Monthly electricity bill",
    "family_member_id": "1"
  }'
```

### Get Family Members
```bash
curl http://localhost:3001/api/family/members
```
