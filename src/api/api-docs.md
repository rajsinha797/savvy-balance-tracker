
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
    "name": "Self",
    "relationship": "Self",
    "is_default": true
  }
]
```

### Get Family Member by ID
- **URL**: `/api/family/members/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[string]` Family member ID
- **Response**: Single family member object
```json
{
  "id": "1",
  "name": "Self",
  "relationship": "Self",
  "is_default": true
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
  "is_default": false
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Family member added successfully",
  "id": "3"
}
```

### Update Family Member
- **URL**: `/api/family/members/:id`
- **Method**: `PUT`
- **URL Parameters**: `id=[string]` Family member ID
- **Request Body**:
```json
{
  "name": "Updated Name",
  "relationship": "Child",
  "is_default": false
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
- **URL Parameters**: `id=[string]` Family member ID
- **Response**:
```json
{
  "status": "success",
  "message": "Family member deleted successfully"
}
```

## Income API

### Get All Incomes
- **URL**: `/api/income`
- **Method**: `GET`
- **Query Parameters**: `family_member_id=[string]` (optional)
- **Response**: Array of income objects
```json
[
  {
    "id": 1,
    "amount": 5000,
    "income_type_id": 1,
    "income_category_id": 1,
    "income_sub_category_id": 1,
    "income_type_name": "Income",
    "income_category_name": "Salary",
    "income_sub_category_name": "Prateek Salary",
    "date": "2025-05-01",
    "description": "Monthly salary",
    "family_member": "Self",
    "family_member_id": "1"
  }
]
```

### Get Income Types
- **URL**: `/api/income/types`
- **Method**: `GET`
- **Response**: Array of income type objects
```json
[
  {
    "id": 1,
    "name": "Income"
  },
  {
    "id": 2,
    "name": "Savings"
  },
  {
    "id": 3, 
    "name": "Investments"
  }
]
```

### Get Income Categories by Type
- **URL**: `/api/income/categories/by-type/:typeId`
- **Method**: `GET`
- **URL Parameters**: `typeId=[integer]` Income type ID
- **Response**: Array of income category objects
```json
[
  {
    "id": 1,
    "income_type_id": 1,
    "name": "Salary"
  },
  {
    "id": 2,
    "income_type_id": 1,
    "name": "Meal Card"
  }
]
```

### Get Income Subcategories by Category
- **URL**: `/api/income/subcategories/by-category/:categoryId`
- **Method**: `GET`
- **URL Parameters**: `categoryId=[integer]` Income category ID
- **Response**: Array of income subcategory objects
```json
[
  {
    "id": 1,
    "income_category_id": 1,
    "name": "Prateek Salary"
  },
  {
    "id": 2,
    "income_category_id": 1,
    "name": "Sunaina Salary"
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
  "id": 1,
  "amount": 5000,
  "income_type_id": 1,
  "income_category_id": 1,
  "income_sub_category_id": 1,
  "income_type_name": "Income",
  "income_category_name": "Salary",
  "income_sub_category_name": "Prateek Salary",
  "date": "2025-05-01",
  "description": "Monthly salary",
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
  "income_type_id": 1,
  "income_category_id": 1,
  "income_sub_category_id": 1,
  "date": "2025-05-01",
  "description": "Monthly salary",
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
  "income_type_id": 1,
  "income_category_id": 1,
  "income_sub_category_id": 1,
  "date": "2025-05-01",
  "description": "Updated monthly salary",
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
    "id": 1,
    "amount": 100,
    "category": "Food",
    "expense_type_id": 3,
    "expense_category_id": 5,
    "expense_sub_category_id": 7,
    "expense_type_name": "Food",
    "expense_category_name": "Groceries",
    "expense_sub_category_name": "Groceries (Vegetables/Fruits)",
    "date": "2025-05-02",
    "description": "Groceries",
    "family_member": "Self",
    "family_member_id": "1"
  }
]
```

### Get Expense Types
- **URL**: `/api/expenses/types`
- **Method**: `GET`
- **Response**: Array of expense type objects
```json
[
  {
    "id": 1,
    "name": "Housing"
  },
  {
    "id": 2,
    "name": "Transportation"
  },
  {
    "id": 3,
    "name": "Food"
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
  "expense_type_id": 3,
  "expense_category_id": 5,
  "expense_sub_category_id": 7,
  "date": "2025-05-02",
  "description": "Groceries",
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
  "expense_type_id": 3,
  "expense_category_id": 5,
  "expense_sub_category_id": 7,
  "date": "2025-05-02",
  "description": "Updated groceries",
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
