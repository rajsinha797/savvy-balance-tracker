
# Enhanced Income and Expense Categorization System

This document describes the enhanced categorization system for both incomes and expenses in the FinTrack application.

## Database Schema Updates

### Income Categorization

Income is now categorized using a three-level hierarchical system:

1. **Income Type**: Broad classification (e.g., Income, Savings, Investments)
2. **Income Category**: Middle-level classification specific to a type (e.g., Salary, Meal Card)
3. **Income Sub-category**: Detailed classification specific to a category (e.g., Prateek Salary, Sunaina Salary)

Table structure:
```sql
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
```

The Income table has been updated to include the new fields:
```sql
ALTER TABLE income
ADD COLUMN income_type_id INT,
ADD COLUMN income_category_id INT,
ADD COLUMN income_sub_category_id INT,
ADD FOREIGN KEY (income_type_id) REFERENCES income_type(id) ON DELETE SET NULL,
ADD FOREIGN KEY (income_category_id) REFERENCES income_category(id) ON DELETE SET NULL,
ADD FOREIGN KEY (income_sub_category_id) REFERENCES income_sub_category(id) ON DELETE SET NULL;
```

### Expense Categorization

Expense is now categorized using a similar three-level hierarchical system:

1. **Expense Type**: Broad classification (e.g., Housing, Transportation, Food)
2. **Expense Category**: Middle-level classification specific to a type (e.g., Rent/Mortgage, Utilities)
3. **Expense Sub-category**: Detailed classification specific to a category (e.g., Home Loan, Maintenance)

Table structure:
```sql
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
```

The Expenses table has been updated to include the new fields:
```sql
ALTER TABLE expenses
ADD COLUMN expense_type_id INT,
ADD COLUMN expense_category_id INT,
ADD COLUMN expense_sub_category_id INT,
ADD FOREIGN KEY (expense_type_id) REFERENCES expense_type(id) ON DELETE SET NULL,
ADD FOREIGN KEY (expense_category_id) REFERENCES expense_category(id) ON DELETE SET NULL,
ADD FOREIGN KEY (expense_sub_category_id) REFERENCES expense_sub_category(id) ON DELETE SET NULL;
```

## UI Updates

### Income Form
The income form now includes dropdown selections for:
- Income Type (selected first)
- Income Category (filtered based on selected type)
- Income Sub-Category (filtered based on selected category)

### Income List
The income list now displays:
- Income Type
- Income Category
- Income Sub-Category
- Other existing fields (date, amount, family member, description)

### Expense Form
The expense form now includes dropdown selections for:
- Expense Type (selected first)
- Expense Category (filtered based on selected type)
- Expense Sub-Category (filtered based on selected category)

### Expense List
The expense list now displays:
- Expense Type
- Expense Category
- Expense Sub-Category
- Other existing fields (date, amount, family member, description)

## API Changes

New API endpoints:
- `/api/income/types` - Get all income types
- `/api/income/categories/by-type/:typeId` - Get income categories by type
- `/api/income/subcategories/by-category/:categoryId` - Get income subcategories by category
- `/api/expenses/types` - Get all expense types
- `/api/expenses/categories/by-type/:typeId` - Get expense categories by type
- `/api/expenses/subcategories/by-category/:categoryId` - Get expense subcategories by category

## Migration Path

The system maintains backward compatibility with the old categorization system by:
1. Keeping the legacy `income_categories` and `expense_categories` tables
2. Maintaining the `category` field in both `income` and `expenses` tables
3. Providing fallback display for records that don't have the new categorization fields populated

This ensures a smooth transition while allowing for more detailed reporting and analysis using the new categorization structure.

## Reporting Benefits

The new categorization system enables:
1. Hierarchical reports showing spending/income at each level
2. More accurate budget allocation and tracking
3. Better insights into financial patterns by type, category, and sub-category
4. Enhanced visualization of financial data with more granular filtering options

## Future Enhancements

Planned improvements to the categorization system include:
1. User-defined custom categories
2. Automatic categorization using machine learning
3. Category-based spending limits and alerts
4. Comparative reports across categorization levels
