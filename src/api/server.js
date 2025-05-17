
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Enhanced CORS configuration with additional origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Added localhost:8080
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Default MySQL user, change if needed
  password: '', // Default empty password, change if needed
  database: 'fintrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Helper function to check if a query result is an array
const isResultArray = (result) => {
  return Array.isArray(result);
};

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  const docsPath = path.join(__dirname, 'api-docs.md');
  
  // Check if docs file exists
  if (fs.existsSync(docsPath)) {
    const docs = fs.readFileSync(docsPath, 'utf8');
    res.type('text/markdown').send(docs);
  } else {
    res.status(404).json({ status: 'error', message: 'Documentation not found' });
  }
});

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'success', message: 'Database connected successfully', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database' });
  }
});

// Get all income categories
app.get('/api/income/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_category');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories' });
  }
});

// Get all income types
app.get('/api/income/types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_type');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income types' });
  }
});

// Get all incomes
app.get('/api/income', async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT i.income_id as id, i.amount, i.date, i.description, 
             it.name as income_type_name,
             ic.name as income_category_name,
             isc.name as income_sub_category_name,
             i.income_type_id, i.income_category_id, i.income_sub_category_id,
             fm.name as family_member, i.family_member_id
      FROM income i
      LEFT JOIN income_type it ON i.income_type_id = it.id
      LEFT JOIN income_category ic ON i.income_category_id = ic.id
      LEFT JOIN income_sub_category isc ON i.income_sub_category_id = isc.id
      LEFT JOIN family_members fm ON i.family_member_id = fm.id
    `;
    
    if (familyId) {
      query += ` WHERE i.family_member_id = ?
                ORDER BY i.date DESC`;
      const [rows] = await pool.query(query, [familyId]);
      res.json(rows);
    } else {
      query += ` ORDER BY i.date DESC`;
      const [rows] = await pool.query(query);
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch incomes' });
  }
});

// Get income by ID
app.get('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't use string parameters directly in SQL queries without validation
    // Make sure it's a valid ID and not a route parameter like "types"
    if (id === 'types' || id === 'categories' || id === 'subcategories') {
      res.status(404).json({ status: 'error', message: 'Income not found' });
      return;
    }
    
    const query = `
      SELECT i.income_id as id, i.amount, i.date, i.description,
             it.name as income_type_name, 
             ic.name as income_category_name,
             ist.name as income_sub_category_name,
             i.income_type_id, i.income_category_id, i.income_sub_category_id,
             i.family_member_id
      FROM income i
      LEFT JOIN income_type it ON i.income_type_id = it.id
      LEFT JOIN income_category ic ON i.income_category_id = ic.id
      LEFT JOIN income_sub_category ist ON i.income_sub_category_id = ist.id
      WHERE i.income_id = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (!rows || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Income not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching income by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income' });
  }
});

// Add new income
app.post('/api/income', async (req, res) => {
  try {
    const { 
      amount, 
      income_type_id,
      income_category_id,
      income_sub_category_id,
      date, 
      description, 
      family_member_id 
    } = req.body;
    
    // Set default values for now
    const family_id = 1; // Default family ID
    const user_id = 1;  // Default user ID
    
    const query = `
      INSERT INTO income (
        family_id, 
        user_id, 
        income_type_id,
        income_category_id,
        income_sub_category_id,
        amount, 
        date, 
        description, 
        family_member_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      family_id, 
      user_id, 
      income_type_id, 
      income_category_id,
      income_sub_category_id,
      amount, 
      date, 
      description,
      family_member_id || null
    ]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Income added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add income' });
  }
});

// Update income
app.put('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      income_type_id,
      income_category_id,
      income_sub_category_id, 
      date, 
      description, 
      family_member_id 
    } = req.body;
    
    const query = `
      UPDATE income
      SET 
        income_type_id = ?,
        income_category_id = ?,
        income_sub_category_id = ?,
        amount = ?, 
        date = ?, 
        description = ?, 
        family_member_id = ?
      WHERE income_id = ?
    `;
    
    const [result] = await pool.query(query, [
      income_type_id, 
      income_category_id,
      income_sub_category_id,
      amount, 
      date, 
      description,
      family_member_id || null, 
      id
    ]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Income not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Income updated successfully' });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update income' });
  }
});

// Delete income
app.delete('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM income WHERE income_id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Income not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete income' });
  }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT e.expense_id as id, e.amount, e.date, e.description, e.category, 
             fm.name as family_member, e.family_member_id
      FROM expenses e
      LEFT JOIN family_members fm ON e.family_member_id = fm.id
    `;
    
    if (familyId) {
      query += ` WHERE e.family_member_id = ?
                ORDER BY e.date DESC`;
      const [rows] = await pool.query(query, [familyId]);
      res.json(rows);
    } else {
      query += ` ORDER BY e.date DESC`;
      const [rows] = await pool.query(query);
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expenses' });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, date, description, family_member_id } = req.body;
    
    const query = `
      INSERT INTO expenses (family_id, user_id, category, amount, date, description, family_member_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      1, // Default family ID 
      1, // Default user ID
      category, 
      amount, 
      date, 
      description,
      family_member_id || null
    ]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Expense added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add expense' });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, description, family_member_id } = req.body;
    
    const query = `
      UPDATE expenses
      SET category = ?, amount = ?, date = ?, description = ?, family_member_id = ?
      WHERE expense_id = ?
    `;
    
    const [result] = await pool.query(query, [
      category, 
      amount, 
      date, 
      description,
      family_member_id || null,
      id
    ]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Expense not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM expenses WHERE expense_id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Expense not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete expense' });
  }
});

// BUDGET API ENDPOINTS

// Sync expenses with budget
app.post('/api/budgets/sync-expenses', async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({
        status: 'error',
        message: 'Year and month are required'
      });
    }

    // Find the budget for this period
    const [budgets] = await pool.query(
      'SELECT id FROM budgets WHERE year = ? AND month = ?', 
      [year, month]
    );

    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No budget found for this period'
      });
    }

    const budgetId = budgets[0].id;

    // Get all expense categories in this period
    const [expenses] = await pool.query(
      `SELECT category, type, sub_category, SUM(amount) as total
       FROM expenses 
       WHERE YEAR(date) = ? AND MONTH(date) = ?
       GROUP BY category, type, sub_category`, 
      [year, month]
    );

    if (!isResultArray(expenses)) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch expenses'
      });
    }

    // Update budget category spent amounts
    for (const expense of expenses) {
      // Find matching budget category
      const [categories] = await pool.query(
        `SELECT id, allocated, spent FROM budget_categories 
         WHERE budget_id = ? AND category = ? AND 
         (type IS NULL OR type = ?) AND
         (sub_category IS NULL OR sub_category = ?)`,
        [budgetId, expense.category, expense.type || null, expense.sub_category || null]
      );

      if (isResultArray(categories) && categories.length > 0) {
        const category = categories[0];
        
        // Update the spent amount
        await pool.query(
          'UPDATE budget_categories SET spent = ? WHERE id = ?',
          [expense.total, category.id]
        );
        
        // Calculate spending difference to update budget total
        const spentDiff = expense.total - category.spent;
        
        if (spentDiff !== 0) {
          await pool.query(
            'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
            [spentDiff, budgetId]
          );
        }
      }
    }

    res.json({
      status: 'success',
      success: true,
      message: 'Budget synchronized with expenses successfully'
    });
  } catch (error) {
    console.error('Error syncing expenses with budget:', error);
    res.status(500).json({
      status: 'error',
      success: false,
      message: 'Failed to sync expenses with budget',
      error: error.message
    });
  }
});

// Get all budget periods
app.get('/api/budgets', async (req, res) => {
  try {
    // Check if the budgets table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_NAME = 'budgets'
    `);

    // If the table doesn't exist, create it
    if (!isResultArray(tables) || tables.length === 0) {
      await pool.query(`
        CREATE TABLE budgets (
          id VARCHAR(36) PRIMARY KEY,
          month VARCHAR(2) NOT NULL,
          year VARCHAR(4) NOT NULL,
          total_allocated DECIMAL(10,2) DEFAULT 0.00,
          total_spent DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE budget_categories (
          id VARCHAR(36) PRIMARY KEY,
          budget_id VARCHAR(36) NOT NULL,
          category VARCHAR(50) NOT NULL,
          type VARCHAR(50),
          sub_category VARCHAR(50),
          allocated DECIMAL(10,2) DEFAULT 0.00,
          spent DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
        )
      `);
    }

    // Query the budgets with their categories
    const [budgets] = await pool.query(`
      SELECT 
        b.id, b.month, b.year, b.total_allocated, b.total_spent
      FROM 
        budgets b
      ORDER BY 
        b.year DESC, b.month DESC
    `);

    // For each budget, get the categories
    const result = [];
    
    if (isResultArray(budgets)) {
      for (const budget of budgets) {
        const [categories] = await pool.query(`
          SELECT 
            id, category, type, sub_category, allocated, spent
          FROM 
            budget_categories
          WHERE 
            budget_id = ?
        `, [budget.id]);
  
        // Calculate remaining and percentage for each category
        const formattedCategories = isResultArray(categories) ? categories.map(category => {
          const remaining = category.allocated - category.spent;
          const percentageUsed = category.allocated > 0 
            ? Math.round((category.spent / category.allocated) * 100) 
            : 0;
            
          return {
            id: category.id,
            category: category.category,
            type: category.type,
            subCategory: category.sub_category,
            allocated: parseFloat(category.allocated),
            spent: parseFloat(category.spent),
            remaining,
            percentageUsed
          };
        }) : [];
  
        result.push({
          id: budget.id,
          month: budget.month,
          year: budget.year,
          totalAllocated: parseFloat(budget.total_allocated),
          totalSpent: parseFloat(budget.total_spent),
          categories: formattedCategories
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch budget periods',
      error: error.message
    });
  }
});

// Get budget period by ID
app.get('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the budget
    const [budgets] = await pool.query(`
      SELECT 
        id, month, year, total_allocated, total_spent
      FROM 
        budgets
      WHERE 
        id = ?
    `, [id]);

    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    const budget = budgets[0];

    // Get the categories for this budget
    const [categories] = await pool.query(`
      SELECT 
        id, category, type, sub_category, allocated, spent
      FROM 
        budget_categories
      WHERE 
        budget_id = ?
    `, [id]);

    // Calculate remaining and percentage for each category
    const formattedCategories = isResultArray(categories) ? categories.map(category => {
      const remaining = category.allocated - category.spent;
      const percentageUsed = category.allocated > 0 
        ? Math.round((category.spent / category.allocated) * 100) 
        : 0;
        
      return {
        id: category.id,
        category: category.category,
        type: category.type,
        subCategory: category.sub_category,
        allocated: parseFloat(category.allocated),
        spent: parseFloat(category.spent),
        remaining,
        percentageUsed
      };
    }) : [];

    res.json({
      id: budget.id,
      month: budget.month,
      year: budget.year,
      totalAllocated: parseFloat(budget.total_allocated),
      totalSpent: parseFloat(budget.total_spent),
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch budget period',
      error: error.message
    });
  }
});

// Create budget period
app.post('/api/budgets', async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Month and year are required fields' 
      });
    }

    // Generate UUID for the budget
    const [uuidResult] = await pool.query('SELECT UUID() as id');
    const id = uuidResult[0].id;

    // Insert the new budget
    await pool.query(`
      INSERT INTO budgets (id, month, year, total_allocated, total_spent)
      VALUES (?, ?, ?, 0, 0)
    `, [id, month, year]);

    // Return the newly created budget
    res.status(201).json({
      id,
      month,
      year,
      totalAllocated: 0,
      totalSpent: 0,
      categories: []
    });
  } catch (error) {
    console.error('Error creating budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create budget period',
      error: error.message
    });
  }
});

// Update budget period
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, totalAllocated, totalSpent } = req.body;

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT id FROM budgets WHERE id = ?', [id]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Build the dynamic SQL query based on provided fields
    let updateFields = [];
    let updateValues = [];

    if (month !== undefined) {
      updateFields.push('month = ?');
      updateValues.push(month);
    }
    if (year !== undefined) {
      updateFields.push('year = ?');
      updateValues.push(year);
    }
    if (totalAllocated !== undefined) {
      updateFields.push('total_allocated = ?');
      updateValues.push(totalAllocated);
    }
    if (totalSpent !== undefined) {
      updateFields.push('total_spent = ?');
      updateValues.push(totalSpent);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No fields provided for update' 
      });
    }

    // Add id to the values array
    updateValues.push(id);

    // Execute the update
    await pool.query(`
      UPDATE budgets
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Get the updated budget
    const [budgets] = await pool.query('SELECT * FROM budgets WHERE id = ?', [id]);
    
    // Check if budgets is an array and not empty
    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch updated budget data' 
      });
    }
    
    const [categories] = await pool.query('SELECT * FROM budget_categories WHERE budget_id = ?', [id]);

    // Calculate remaining and percentage for each category
    const formattedCategories = isResultArray(categories) ? categories.map(category => {
      const remaining = category.allocated - category.spent;
      const percentageUsed = category.allocated > 0 
        ? Math.round((category.spent / category.allocated) * 100) 
        : 0;
        
      return {
        id: category.id,
        category: category.category,
        type: category.type,
        subCategory: category.sub_category,
        allocated: parseFloat(category.allocated),
        spent: parseFloat(category.spent),
        remaining,
        percentageUsed
      };
    }) : [];

    const budget = budgets[0];
    res.json({
      id: budget.id,
      month: budget.month,
      year: budget.year,
      totalAllocated: parseFloat(budget.total_allocated),
      totalSpent: parseFloat(budget.total_spent),
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error updating budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update budget period',
      error: error.message
    });
  }
});

// Delete budget period
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT id FROM budgets WHERE id = ?', [id]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Delete the budget (cascade will delete associated categories)
    await pool.query('DELETE FROM budgets WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Budget period deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete budget period',
      error: error.message
    });
  }
});

// Add category to budget
app.post('/api/budgets/:budgetId/categories', async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { category, type, subCategory, allocated } = req.body;
    
    // Validate required fields
    if (!category || allocated === undefined) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Category name and allocated amount are required' 
      });
    }

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT * FROM budgets WHERE id = ?', [budgetId]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Check if this category already exists in this budget with the same type and subcategory
    const [categoryCheck] = await pool.query(
      'SELECT id FROM budget_categories WHERE budget_id = ? AND category = ? AND type <=> ? AND sub_category <=> ?', 
      [budgetId, category, type || null, subCategory || null]
    );
    
    if (isResultArray(categoryCheck) && categoryCheck.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This category combination already exists in this budget' 
      });
    }

    // Generate UUID for the category
    const [uuidResult] = await pool.query('SELECT UUID() as id');
    const id = uuidResult[0].id;

    // Insert the new category
    await pool.query(`
      INSERT INTO budget_categories (id, budget_id, category, type, sub_category, allocated, spent)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [id, budgetId, category, type || null, subCategory || null, allocated]);

    // Update the total_allocated in the budget
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated + ? 
      WHERE id = ?
    `, [allocated, budgetId]);

    // Return the newly created category
    const remaining = allocated;
    const percentageUsed = 0;
    
    res.status(201).json({
      id,
      category,
      type,
      subCategory,
      allocated: parseFloat(allocated),
      spent: 0,
      remaining,
      percentageUsed
    });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to add budget category',
      error: error.message
    });
  }
});

// Update category in budget
app.put('/api/budgets/:budgetId/categories/:categoryId', async (req, res) => {
  try {
    const { budgetId, categoryId } = req.params;
    const { allocated, spent, type, subCategory } = req.body;

    // Check if the budget and category exist
    const [categoryCheck] = await pool.query(
      'SELECT * FROM budget_categories WHERE id = ? AND budget_id = ?', 
      [categoryId, budgetId]
    );
    
    if (!isResultArray(categoryCheck) || categoryCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget category not found' 
      });
    }

    const oldCategory = categoryCheck[0];
    const newAllocated = allocated !== undefined ? allocated : oldCategory.allocated;
    const newSpent = spent !== undefined ? spent : oldCategory.spent;
    const newType = type !== undefined ? type : oldCategory.type;
    const newSubCategory = subCategory !== undefined ? subCategory : oldCategory.sub_category;

    // Calculate the difference to update budget totals
    const allocatedDiff = newAllocated - oldCategory.allocated;
    const spentDiff = newSpent - oldCategory.spent;

    // Update the category
    await pool.query(`
      UPDATE budget_categories
      SET allocated = ?, spent = ?, type = ?, sub_category = ?
      WHERE id = ?
    `, [newAllocated, newSpent, newType, newSubCategory, categoryId]);

    // Update the budget totals
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated + ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `, [allocatedDiff, spentDiff, budgetId]);

    // Calculate the updated values
    const remaining = newAllocated - newSpent;
    const percentageUsed = newAllocated > 0 
      ? Math.round((newSpent / newAllocated) * 100) 
      : 0;

    // Return the updated category
    res.json({
      id: categoryId,
      category: oldCategory.category,
      type: newType,
      subCategory: newSubCategory,
      allocated: parseFloat(newAllocated),
      spent: parseFloat(newSpent),
      remaining,
      percentageUsed
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update budget category',
      error: error.message
    });
  }
});

// Delete category from budget
app.delete('/api/budgets/:budgetId/categories/:categoryId', async (req, res) => {
  try {
    const { budgetId, categoryId } = req.params;

    // Check if the category exists
    const [categoryCheck] = await pool.query(
      'SELECT * FROM budget_categories WHERE id = ? AND budget_id = ?', 
      [categoryId, budgetId]
    );
    
    if (!isResultArray(categoryCheck) || categoryCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget category not found' 
      });
    }

    const category = categoryCheck[0];

    // Update the budget totals before deleting the category
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated - ?,
          total_spent = total_spent - ?
      WHERE id = ?
    `, [category.allocated, category.spent, budgetId]);

    // Delete the category
    await pool.query('DELETE FROM budget_categories WHERE id = ?', [categoryId]);

    res.json({
      status: 'success',
      message: 'Budget category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete budget category',
      error: error.message
    });
  }
});

// Get expense categories
app.get('/api/expense-categories', async (req, res) => {
  try {
    // Check if the expense_categories table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_NAME = 'expense_categories'
    `);

    // If the table doesn't exist, create it and add some default categories
    if (!isResultArray(tables) || tables.length === 0) {
      await pool.query(`
        CREATE TABLE expense_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const defaultCategories = [
        'Housing', 'Utilities', 'Groceries', 'Transportation', 
        'Entertainment', 'Health', 'Personal Care', 'Education', 
        'Debt Payments', 'Insurance', 'Savings', 'Investments', 
        'Charity', 'Other'
      ];
      
      for (const category of defaultCategories) {
        await pool.query('INSERT INTO expense_categories (name) VALUES (?)', [category]);
      }
    }

    const [categories] = await pool.query('SELECT id, name FROM expense_categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch expense categories',
      error: error.message
    });
  }
});

// FAMILY API ENDPOINTS - Enhanced and expanded

// Get all families
app.get('/api/families', async (req, res) => {
  try {
    const query = `SELECT family_id, name FROM family`;
    const [rows] = await pool.query(query);
    
    if (!isResultArray(rows)) {
      return res.json([]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch families' });
  }
});

// Get family by ID
app.get('/api/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT family_id, name FROM family WHERE family_id = ?`;
    const [rows] = await pool.query(query, [id]);
    
    if (!isResultArray(rows) || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family' });
  }
});

// Add a new family
app.post('/api/families', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `INSERT INTO family (name) VALUES (?)`;
    const [result] = await pool.query(query, [name]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Family created successfully',
      id
    });
  } catch (error) {
    console.error('Error adding family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create family' });
  }
});

// Update family
app.put('/api/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `UPDATE family SET name = ? WHERE family_id = ?`;
    const [result] = await pool.query(query, [name, id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family updated successfully' });
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update family' });
  }
});

// Delete family
app.delete('/api/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if family has members first
    const [memberCheck] = await pool.query('SELECT COUNT(*) as memberCount FROM family_members WHERE family_id = ?', [id]);
    
    if (isResultArray(memberCheck) && memberCheck[0].memberCount > 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family with existing members. Remove members first.' 
      });
      return;
    }
    
    const query = 'DELETE FROM family WHERE family_id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete family' });
  }
});

// Family members API endpoints - Enhanced with better error handling and validation
app.get('/api/family/members', async (req, res) => {
  try {
    const familyId = req.query.family_id || 1; // Default to family ID 1 if not specified
    
    const query = `
      SELECT fm.id, fm.family_id, fm.name, fm.relationship, fm.is_default, 
             f.name as family_name
      FROM family_members fm
      JOIN family f ON fm.family_id = f.family_id
      WHERE fm.family_id = ?
    `;
    
    const [rows] = await pool.query(query, [familyId]);
    
    if (!isResultArray(rows)) {
      return res.json([]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family members' });
  }
});

app.get('/api/family/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT fm.id, fm.family_id, fm.name, fm.relationship, fm.is_default,
             f.name as family_name
      FROM family_members fm
      JOIN family f ON fm.family_id = f.family_id
      WHERE fm.id = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (!isResultArray(rows) || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family member by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family member' });
  }
});

app.post('/api/family/members', async (req, res) => {
  try {
    const { name, relationship, is_default, family_id = 1 } = req.body;
    
    // Validate required fields
    if (!name || !relationship) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required fields' 
      });
      return;
    }
    
    // Check if family exists first
    const [familyCheck] = await pool.query('SELECT family_id FROM family WHERE family_id = ?', [family_id]);
    if (Array.isArray(familyCheck) && familyCheck.length === 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'The specified family does not exist' 
      });
      return;
    }
    
    // If this is set as default, unset any previous defaults
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = ?', [family_id]);
    }
    
    const query = `
      INSERT INTO family_members (family_id, name, relationship, is_default)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [family_id, name, relationship, is_default]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Family member added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add family member' });
  }
});

app.put('/api/family/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relationship, is_default, family_id } = req.body;
    
    // Validate required fields
    if (!name || !relationship) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required fields' 
      });
      return;
    }
    
    // Get current family ID for this member
    const [currentData] = await pool.query('SELECT family_id FROM family_members WHERE id = ?', [id]);
    if (Array.isArray(currentData) && currentData.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    const currentFamilyId = currentData[0].family_id;
    const targetFamilyId = family_id || currentFamilyId;
    
    // Check if target family exists if changing family
    if (family_id && family_id !== currentFamilyId) {
      const [familyCheck] = await pool.query('SELECT family_id FROM family WHERE family_id = ?', [family_id]);
      if (Array.isArray(familyCheck) && familyCheck.length === 0) {
        res.status(400).json({ 
          status: 'error', 
          message: 'The specified target family does not exist' 
        });
        return;
      }
    }
    
    // If this is set as default, unset any previous defaults in the family
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = ?', [targetFamilyId]);
    }
    
    const query = `
      UPDATE family_members
      SET name = ?, relationship = ?, is_default = ?, family_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [name, relationship, is_default, targetFamilyId, id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member updated successfully' });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update family member' });
  }
});

app.delete('/api/family/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if this is a default member
    const [memberCheck] = await pool.query('SELECT is_default, family_id FROM family_members WHERE id = ?', [id]);
    
    if (!isResultArray(memberCheck) || memberCheck.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    if (memberCheck[0].is_default) {
      res.status(400).json({ status: 'error', message: 'Cannot delete the default family member' });
      return;
    }
    
    // Check if member has any transactions
    const [incomeCheck] = await pool.query('SELECT COUNT(*) as count FROM income WHERE family_member_id = ?', [id]);
    const [expenseCheck] = await pool.query('SELECT COUNT(*) as count FROM expenses WHERE family_member_id = ?', [id]);
    
    if ((incomeCheck[0].count > 0) || (expenseCheck[0].count > 0)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family member with existing transactions' 
      });
      return;
    }
    
    const query = 'DELETE FROM family_members WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete family member',
      error: error.message
    });
  }
});

// Get reports data (monthly summaries)
app.get('/api/reports/monthly', async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(amount) as total
      FROM income
    `;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                LIMIT 12`;
      const [incomeRows] = await pool.query(query, [familyId]);
      
      query = `
        SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          SUM(amount) as total
        FROM expenses
        WHERE family_member_id = ?
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [expenseRows] = await pool.query(query, [familyId]);
      
      // Check if the results are arrays before sending them
      const incomes = isResultArray(incomeRows) ? incomeRows : [];
      const expenses = isResultArray(expenseRows) ? expenseRows : [];
      
      res.json({ income: incomes, expenses: expenses });
    } else {
      query += `
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [incomeRows] = await pool.query(query);
      
      query = `
        SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          SUM(amount) as total
        FROM expenses
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [expenseRows] = await pool.query(query);
      
      // Check if the results are arrays before sending them
      const incomes = isResultArray(incomeRows) ? incomeRows : [];
      const expenses = isResultArray(expenseRows) ? expenseRows : [];
      
      res.json({ income: incomes, expenses: expenses });
    }
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monthly reports' });
  }
});

// Get weekly spending patterns
app.get('/api/reports/weekly', async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        DAYOFWEEK(date) as day_of_week,
        SUM(amount) as total
      FROM expenses
    `;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query, [familyId]);
      
      // Check if the result is an array before sending it
      const result = isResultArray(rows) ? rows : [];
      
      res.json(result);
    } else {
      query += ` GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query);
      
      // Check if the result is an array before sending it
      const result = isResultArray(rows) ? rows : [];
      
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching weekly spending patterns:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch weekly spending patterns' });
  }
});

// API Documentation endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Welcome to FinTrack API',
    endpoints: {
      docs: '/api/docs',
      test: '/api/test',
      income: '/api/income',
      incomeCategories: '/api/income/categories',
      expenses: '/api/expenses',
      families: '/api/families',
      familyMembers: '/api/family/members',
      reports: ['/api/reports/monthly', '/api/reports/weekly']
    }
  });
});

// Add API endpoint for income types
app.get('/api/income/types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_type');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income types' });
  }
});

// Add API endpoint for income categories by type
app.get('/api/income/categories/by-type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM income_category WHERE income_type_id = ?',
      [typeId]
    );
    
    // Check if the result is an array before sending it
    const result = isResultArray(rows) ? rows : [];
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching income categories for type ${req.params.typeId}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories' });
  }
});

// Add API endpoint for income subcategories by category
app.get('/api/income/subcategories/by-category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM income_sub_category WHERE income_category_id = ?',
      [categoryId]
    );
    
    // Check if the result is an array before sending it
    const result = isResultArray(rows) ? rows : [];
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching income subcategories for category ${req.params.categoryId}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income subcategories' });
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api/docs`);
});

export default app;
