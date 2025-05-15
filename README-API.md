
# FinTrack API Setup and Usage Guide

## Prerequisites

- Node.js (version 16 or later recommended)
- MySQL server running locally
- Database named `fintrack` created with the required schema

## Setting up the API server

1. Make sure your MySQL server is running and the `fintrack` database is created.

2. Configure the database connection in `src/api/server.ts` (if your MySQL configuration differs from the defaults):
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

## API Endpoints

- **Base URL**: `http://localhost:3001`

### Test Connection
- `GET /api/test` - Test database connection

### Income Endpoints
- `GET /api/income/categories` - Get all income categories
- `GET /api/income` - Get all incomes
- `GET /api/income/:id` - Get income by ID
- `POST /api/income` - Add new income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expense Endpoints
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

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

## Troubleshooting

### CORS Issues

If you're experiencing CORS issues, check the CORS configuration in `src/api/server.ts`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Add additional origins if your frontend is running on a different port.

### ESM/CommonJS Issues

This project uses ES modules. If you see errors related to ESM/CommonJS compatibility:

1. Make sure your Node.js version is up-to-date
2. Check that the `type` field in your package.json is set correctly 
3. Use the `.mjs` extension for ES modules or `.cjs` for CommonJS modules when needed

### Database Connectivity

If you have trouble connecting to the database:

1. Verify MySQL is running: `mysql --version`
2. Check your credentials in the server.ts file
3. Make sure the fintrack database exists: `mysql -u root -e "SHOW DATABASES;"`
4. Test the connection: `curl http://localhost:3001/api/test`

## Database Schema

The schema includes tables for:
- `family` - Central entity for grouping users
- `user` - User details and authentication
- `income_category` - Categories for income
- `expense_category` - Categories for expenses
- `income` - Income transactions
- `expenses` - Expense transactions
- `family_members` - Family member details

For the complete schema, see `src/api/setup-database.sql`
