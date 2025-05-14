# FinTrack API Documentation

This document provides comprehensive information about the FinTrack API endpoints, request/response formats, and usage instructions.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Family API](#family-api)
3. [Family Members API](#family-members-api)
4. [Income API](#income-api)
5. [Expenses API](#expenses-api)
6. [Reports API](#reports-api)

## Setup Instructions

### Database Setup
1. Install MySQL Server (if not already installed)
2. Run the setup script to create the database and tables:
```bash
mysql -u root -p < src/api/setup-database.sql
```

### Running the API Server
1. Install the required dependencies:
```bash
npm install
```

2. Start the API server:
```bash
npm run start-api
```

The API server will start on `http://localhost:3001`.

### Testing the API Connection
Send a GET request to `http://localhost:3001/api/test` to test the database connection.

## Family API

### Get All Families
- **URL**: `/api/families`
- **Method**: `GET`
- **Response**: Array of family objects
```json
[
  {
    "family_id": 1,
    "name": "Smith Family"
  }
]
```

### Get Family by ID
- **URL**: `/api/families/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]` Family ID
- **Response**: Single family object
```json
{
  "family_id": 1,
  "name": "Smith Family"
}
```

### Create New Family
- **URL**: `/api/families`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "Johnson Family"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Family created successfully",
  "id": 2
}
```

### Update Family
- **URL**: `/api/families/:id`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]` Family ID
- **Request Body**:
```json
{
  "name": "Updated Family Name"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Family updated successfully"
}
```

### Delete Family
- **URL**: `/api/families/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]` Family ID
- **Response**:
```json
{
  "status": "success",
  "message": "Family deleted successfully"
}
```
- **Notes**: Cannot delete a family that has members. Remove all members first.

## Family Members API

### Get All Family Members
- **URL**: `/api/family/members`
- **Method**: `GET`
- **Query Parameters**: `family_id=[integer]` (optional, defaults to 1)
- **Response**: Array of family member objects
```json
[
  {
    "id": "1",
    "family_id": 1,
    "name": "Self",
    "relationship": "Self",
    "is_default": true,
    "family_name": "Smith Family"
  }
]
```

### Get Family Member by ID
- **URL**: `/api/family/members/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]` Family member ID
- **Response**: Single family member object
```json
{
  "id": "1",
  "family_id": 1,
  "name": "Self",
  "relationship": "Self",
  "is_default": true,
  "family_name": "Smith Family"
}
```

### Create New Family Member
- **URL**: `/api/family/members`
- **Method**: `POST`
- **Request Body**:
```json
{
  "name": "Child",
  "relationship": "Child",
  "is_default": false,
  "family_id": 1
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Family member added successfully",
  "id": 3
}
```
- **Notes**: 
  - If `is_default` is `true`, all other members in the same family will be set to `is_default: false`.
  - `family_id` is optional and defaults to 1.

### Update Family Member
- **URL**: `/api/family/members/:id`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]` Family member ID
- **Request Body**:
```json
{
  "name": "Updated Name",
  "relationship": "Child",
  "is_default": false,
  "family_id": 1
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Family member updated successfully"
}
```

### Delete Family Member
- **URL**: `/api/family/members/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]` Family member ID
- **Response**:
```json
{
  "status": "success",
  "message": "Family member deleted successfully"
}
```
- **Notes**: 
  - Cannot delete a family member that is set as default.
  - Cannot delete a family member that has transactions.

## Income API
### Get All Incomes
- **URL**: `/api/income`
- **Method**: `GET`
- **Query Parameters**: `family_member_id=[string]` (optional)
- **Response**: Array of income objects
```json
[
  {
    "id": "1",
    "amount": 5000,
    "category": "Salary",
    "description": "Monthly salary",
    "date": "2025-05-01",
    "family_member": "Self",
    "family_member_id": "1"
  }
]
```

### Get Income Categories
- **URL**: `/api/income/categories`
- **Method**: `GET`
- **Response**: Array of income category objects
```json
[
  {
    "category_id": 1,
    "name": "Salary"
  },
  {
    "category_id": 2,
    "name": "Freelance"
  }
]
```

### Get Income by ID
- **URL**: `/api/income/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]` Income ID
- **Response**: Single income object
```json
{
  "id": "1",
  "amount": 5000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2025-05-01",
  "family_member_id": "1"
}
```

### Create New Income
- **URL**: `/api/income`
- **Method**: `POST`
- **Request Body**: Income data object
```json
{
  "amount": 5000,
  "category_id": 1,
  "description": "Monthly salary",
  "date": "2025-05-01",
  "family_member_id": "1"
}
```
- **Response**: Success message with created ID
```json
{
  "status": "success",
  "message": "Income added successfully",
  "id": 4
}
```

### Update Income
- **URL**: `/api/income/:id`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]` Income ID
- **Request Body**: Updated income data object
```json
{
  "amount": 5500,
  "category_id": 1,
  "description": "Updated monthly salary",
  "date": "2025-05-01",
  "family_member_id": "1"
}
```
- **Response**: Success message
```json
{
  "status": "success",
  "message": "Income updated successfully"
}
```

### Delete Income
- **URL**: `/api/income/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]` Income ID
- **Response**: Success message
```json
{
  "status": "success",
  "message": "Income deleted successfully"
}
```

## Expenses API
### Get All Expenses
- **URL**: `/api/expenses`
- **Method**: `GET`
- **Query Parameters**: `family_member_id=[string]` (optional)
- **Response**: Array of expense objects
```json
[
  {
    "id": "1",
    "amount": 100,
    "category": "Food",
    "description": "Groceries",
    "date": "2025-05-02",
    "family_member": "Self",
    "family_member_id": "1"
  }
]
```

### Create New Expense
- **URL**: `/api/expenses`
- **Method**: `POST`
- **Request Body**: Expense data object
```json
{
  "amount": 100,
  "category": "Food",
  "description": "Groceries",
  "date": "2025-05-02",
  "family_member_id": "1"
}
```
- **Response**: Success message with created ID
```json
{
  "status": "success",
  "message": "Expense added successfully",
  "id": 2
}
```

### Update Expense
- **URL**: `/api/expenses/:id`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]` Expense ID
- **Request Body**: Updated expense data object
```json
{
  "amount": 120,
  "category": "Food",
  "description": "Updated groceries",
  "date": "2025-05-02",
  "family_member_id": "1"
}
```
- **Response**: Success message
```json
{
  "status": "success",
  "message": "Expense updated successfully"
}
```

### Delete Expense
- **URL**: `/api/expenses/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]` Expense ID
- **Response**: Success message
```json
{
  "status": "success",
  "message": "Expense deleted successfully"
}
```

## Reports API
### Get Monthly Reports
- **URL**: `/api/reports/monthly`
- **Method**: `GET`
- **Query Parameters**: `family_member_id=[string]` (optional)
- **Response**: Object with income and expenses summaries by month
```json
{
  "income": [
    {
      "year": 2025,
      "month": 5,
      "total": 5500
    }
  ],
  "expenses": [
    {
      "year": 2025,
      "month": 5,
      "total": 120
    }
  ]
}
```

### Get Weekly Spending Patterns
- **URL**: `/api/reports/weekly`
- **Method**: `GET`
- **Query Parameters**: `family_member_id=[string]` (optional)
- **Response**: Array of spending data by day of week
```json
[
  {
    "day_of_week": 2,
    "total": 120
  }
]
```
