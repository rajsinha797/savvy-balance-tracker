import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isResultArray, getSafeRows } from './utils/queryHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'], // Add your frontend URLs
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
const errorHandler = (err: any, req: Request, res: Response, next: Function) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// API Documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
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
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    const rows = isResultArray(result) ? result : [];
    res.json({ status: 'success', message: 'Database connected successfully', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database' });
  }
});

// Get all income categories (legacy)
app.get('/api/income/categories', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id as category_id, name FROM income_category');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories' });
  }
});

// NEW API: Get all income types
app.get('/api/income/types', async (req: Request, res: Response) => {
  try {
    const [result] = await pool.query('SELECT id, name FROM income_type');
    const rows = isResultArray(result) ? result : [];
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income types' });
  }
});

// NEW API: Get income categories by type
app.get('/api/income/categories/by-type/:typeId', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const [result] = await pool.query('SELECT id, income_type_id, name FROM income_category WHERE income_type_id = ?', [typeId]);
    const rows = isResultArray(result) ? result : [];
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income categories by type:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories by type' });
  }
});

// NEW API: Get income subcategories by category
app.get('/api/income/subcategories/by-category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const [result] = await pool.query('SELECT id, income_category_id, name FROM income_sub_category WHERE income_category_id = ?', [categoryId]);
    const rows = isResultArray(result) ? result : [];
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income subcategories by category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income subcategories by category' });
  }
});

// Get all incomes with enhanced categorization
app.get('/api/income', async (req: Request, res: Response) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT i.id, i.amount, i.date, i.description, 
             i.category, i.income_type_id, i.income_category_id, i.income_sub_category_id,
             it.name as income_type_name, ic.name as income_category_name, isc.name as income_sub_category_name,
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
app.get('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is numeric (an actual income ID)
    if (/^\d+$/.test(id)) {
      const query = `
        SELECT i.id, i.amount, i.date, i.description, 
               i.category, i.income_type_id, i.income_category_id, i.income_sub_category_id,
               it.name as income_type_name, ic.name as income_category_name, isc.name as income_sub_category_name,
               i.family_member_id
        FROM income i
        LEFT JOIN income_type it ON i.income_type_id = it.id
        LEFT JOIN income_category ic ON i.income_category_id = ic.id
        LEFT JOIN income_sub_category isc ON i.income_sub_category_id = isc.id
        WHERE i.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      
      if (Array.isArray(rows) && rows.length === 0) {
        res.status(404).json({ status: 'error', message: 'Income not found' });
        return;
      }
      
      res.json(rows[0]);
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid income ID format' });
    }
  } catch (error) {
    console.error('Error fetching income by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income' });
  }
});

// Add new income with enhanced categorization
app.post('/api/income', async (req: Request, res: Response) => {
  try {
    const { amount, category, income_type_id, income_category_id, income_sub_category_id, date, description, family_member_id } = req.body;
    
    const query = `
      INSERT INTO income (amount, category, income_type_id, income_category_id, income_sub_category_id, date, description, family_member_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      amount, 
      category || 'Uncategorized', 
      income_type_id || null, 
      income_category_id || null, 
      income_sub_category_id || null,
      date, 
      description,
      family_member_id || null
    ]);
    
    const resultWithInsertId = result as mysql.ResultSetHeader;
    const id = resultWithInsertId.insertId;
    
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

// Update income with enhanced categorization
app.put('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, income_type_id, income_category_id, income_sub_category_id, date, description, family_member_id } = req.body;
    
    const query = `
      UPDATE income
      SET amount = ?, category = ?, income_type_id = ?, income_category_id = ?, income_sub_category_id = ?, 
          date = ?, description = ?, family_member_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      amount, 
      category || 'Uncategorized',
      income_type_id || null, 
      income_category_id || null, 
      income_sub_category_id || null,
      date, 
      description,
      family_member_id || null, 
      id
    ]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
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
app.delete('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM income WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Income not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete income' });
  }
});

// NEW API: Get all expense types
app.get('/api/expenses/types', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM expense_type');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense types' });
  }
});

// NEW API: Get expense categories by type
app.get('/api/expenses/categories/by-type/:typeId', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const [rows] = await pool.query('SELECT id, expense_type_id, name FROM expense_category WHERE expense_type_id = ?', [typeId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense categories by type:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense categories by type' });
  }
});

// NEW API: Get expense subcategories by category
app.get('/api/expenses/subcategories/by-category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query('SELECT id, expense_category_id, name FROM expense_sub_category WHERE expense_category_id = ?', [categoryId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense subcategories by category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense subcategories by category' });
  }
});

// Get all expenses with enhanced categorization
app.get('/api/expenses', async (req: Request, res: Response) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT e.id, e.amount, e.date, e.description, e.category,
             e.expense_type_id, e.expense_category_id, e.expense_sub_category_id,
             et.name as expense_type_name, ec.name as expense_category_name, esc.name as expense_sub_category_name,
             fm.name as family_member, e.family_member_id
      FROM expenses e
      LEFT JOIN expense_type et ON e.expense_type_id = et.id
      LEFT JOIN expense_category ec ON e.expense_category_id = ec.id
      LEFT JOIN expense_sub_category esc ON e.expense_sub_category_id = esc.id
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

// Add new expense with enhanced categorization
app.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const { amount, category, expense_type_id, expense_category_id, expense_sub_category_id, date, description, family_member_id, updateBudget } = req.body;
    
    const query = `
      INSERT INTO expenses (amount, category, expense_type_id, expense_category_id, expense_sub_category_id, date, description, family_member_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      amount, 
      category || 'Uncategorized',
      expense_type_id || null,
      expense_category_id || null,
      expense_sub_category_id || null,
      date, 
      description,
      family_member_id || null
    ]);
    
    const resultWithInsertId = result as mysql.ResultSetHeader;
    const id = resultWithInsertId.insertId;
    
    // If updateBudget flag is set, update the corresponding budget category
    if (updateBudget) {
      try {
        // Extract year and month from date
        const expenseDate = new Date(date);
        const year = expenseDate.getFullYear();
        const month = expenseDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        // Check if there's a budget for this period
        const [budgets] = await pool.query(
          'SELECT id FROM budgets WHERE year = ? AND month = ?',
          [year, month]
        );
        
        if (Array.isArray(budgets) && budgets.length > 0) {
          // @ts-ignore
          const budgetId = budgets[0].id;
          
          // Update the budget category that matches this expense's category
          await pool.query(
            `UPDATE budget_categories 
             SET spent = spent + ? 
             WHERE budget_id = ? AND category = ?`,
            [amount, budgetId, category]
          );
          
          // Update the total spent in the budget
          await pool.query(
            'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
            [amount, budgetId]
          );
        }
      } catch (budgetError) {
        console.error('Error updating budget with expense:', budgetError);
        // Don't fail the expense creation if budget update fails
      }
    }
    
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

// Update expense with enhanced categorization
app.put('/api/expenses/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, expense_type_id, expense_category_id, expense_sub_category_id, date, description, family_member_id, updateBudget } = req.body;
    
    // Get the old expense details if we're updating the budget
    let oldAmount = 0;
    let oldCategory = '';
    let oldDate: Date | null = null;
    
    if (updateBudget) {
      const [oldExpenses] = await pool.query(
        'SELECT amount, category, date FROM expenses WHERE id = ?',
        [id]
      );
      
      if (Array.isArray(oldExpenses) && oldExpenses.length > 0) {
        // @ts-ignore
        oldAmount = parseFloat(oldExpenses[0].amount);
        // @ts-ignore
        oldCategory = oldExpenses[0].category;
        // @ts-ignore
        oldDate = new Date(oldExpenses[0].date);
      }
    }
    
    const query = `
      UPDATE expenses
      SET amount = ?, category = ?, expense_type_id = ?, expense_category_id = ?, expense_sub_category_id = ?,
          date = ?, description = ?, family_member_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      amount, 
      category || 'Uncategorized',
      expense_type_id || null,
      expense_category_id || null,
      expense_sub_category_id || null,
      date, 
      description,
      family_member_id || null,
      id
    ]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Expense not found' });
      return;
    }
    
    // If updateBudget flag is set, update the corresponding budget category
    if (updateBudget && oldDate) {
      try {
        // Extract year and month from old and new dates
        const oldYear = oldDate.getFullYear();
        const oldMonth = oldDate.getMonth() + 1;
        
        const newDate = new Date(date);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        
        // If the date has changed to a different month/year, we need to update both old and new budget periods
        if (oldYear !== newYear || oldMonth !== newMonth) {
          // Update old budget (subtract old amount)
          const [oldBudgets] = await pool.query(
            'SELECT id FROM budgets WHERE year = ? AND month = ?',
            [oldYear, oldMonth]
          );
          
          if (Array.isArray(oldBudgets) && oldBudgets.length > 0) {
            // @ts-ignore
            const oldBudgetId = oldBudgets[0].id;
            
            // Subtract from old category
            await pool.query(
              `UPDATE budget_categories 
               SET spent = spent - ? 
               WHERE budget_id = ? AND category = ?`,
              [oldAmount, oldBudgetId, oldCategory]
            );
            
            // Update old budget total
            await pool.query(
              'UPDATE budgets SET total_spent = total_spent - ? WHERE id = ?',
              [oldAmount, oldBudgetId]
            );
          }
          
          // Update new budget (add new amount)
          const [newBudgets] = await pool.query(
            'SELECT id FROM budgets WHERE year = ? AND month = ?',
            [newYear, newMonth]
          );
          
          if (Array.isArray(newBudgets) && newBudgets.length > 0) {
            // @ts-ignore
            const newBudgetId = newBudgets[0].id;
            
            // Add to new category
            await pool.query(
              `UPDATE budget_categories 
               SET spent = spent + ? 
               WHERE budget_id = ? AND category = ?`,
              [amount, newBudgetId, category]
            );
            
            // Update new budget total
            await pool.query(
              'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
              [amount, newBudgetId]
            );
          }
        }
        // If only the amount or category changed but date remains in same month/year
        else {
          const [budgets] = await pool.query(
            'SELECT id FROM budgets WHERE year = ? AND month = ?',
            [oldYear, oldMonth]
          );
          
          if (Array.isArray(budgets) && budgets.length > 0) {
            // @ts-ignore
            const budgetId = budgets[0].id;
            
            if (oldCategory !== category) {
              // Category changed - subtract from old and add to new
              await pool.query(
                `UPDATE budget_categories 
                 SET spent = spent - ? 
                 WHERE budget_id = ? AND category = ?`,
                [oldAmount, budgetId, oldCategory]
              );
              
              await pool.query(
                `UPDATE budget_categories 
                 SET spent = spent + ? 
                 WHERE budget_id = ? AND category = ?`,
                [amount, budgetId, category]
              );
              
              // If amount also changed, update the budget total
              if (oldAmount !== amount) {
                const difference = amount - oldAmount;
                await pool.query(
                  'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
                  [difference, budgetId]
                );
              }
            }
            // If only amount changed
            else if (oldAmount !== amount) {
              // Update the category spent amount
              await pool.query(
                `UPDATE budget_categories 
                 SET spent = spent - ? + ? 
                 WHERE budget_id = ? AND category = ?`,
                [oldAmount, amount, budgetId, category]
              );
              
              // Update the budget total
              const difference = amount - oldAmount;
              await pool.query(
                'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
                [difference, budgetId]
              );
            }
          }
        }
      } catch (budgetError) {
        console.error('Error updating budget with expense change:', budgetError);
        // Don't fail the expense update if budget update fails
      }
    }
    
    res.json({ status: 'success', message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const updateBudget = req.query.updateBudget === 'true';
    
    // Get the expense details if we're updating the budget
    if (updateBudget) {
      const [expenses] = await pool.query(
        'SELECT amount, category, date FROM expenses WHERE id = ?',
        [id]
      );
      
      if (Array.isArray(expenses) && expenses.length > 0) {
        try {
          // @ts-ignore
          const amount = parseFloat(expenses[0].amount);
          // @ts-ignore
          const category = expenses[0].category;
          // @ts-ignore
          const expenseDate = new Date(expenses[0].date);
          const year = expenseDate.getFullYear();
          const month = expenseDate.getMonth() + 1;
          
          // Check if there's a budget for this period
          const [budgets] = await pool.query(
            'SELECT id FROM budgets WHERE year = ? AND month = ?',
            [year, month]
          );
          
          if (Array.isArray(budgets) && budgets.length > 0) {
            // @ts-ignore
            const budgetId = budgets[0].id;
            
            // Update the budget category
            await pool.query(
              `UPDATE budget_categories 
               SET spent = spent - ? 
               WHERE budget_id = ? AND category = ?`,
              [amount, budgetId, category]
            );
            
            // Update the total spent in the budget
            await pool.query(
              'UPDATE budgets SET total_spent = total_spent - ? WHERE id = ?',
              [amount, budgetId]
            );
          }
        } catch (budgetError) {
          console.error('Error updating budget after expense deletion:', budgetError);
          // Don't fail the expense deletion if budget update fails
        }
      }
    }
    
    const query = 'DELETE FROM expenses WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Expense not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete expense' });
  }
});

// Get expenses by budget period
app.get('/api/expenses/budget', async (req: Request, res: Response) => {
  try {
    const year = req.query.year;
    const month = req.query.month;
    
    if (!year || !month) {
      res.status(400).json({ status: 'error', message: 'Year and month are required' });
      return;
    }
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(parseInt(year as string), parseInt(month as string), 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    
    const query = `
      SELECT e.id, e.amount, e.category, e.date, e.description,
             e.expense_type_id, e.expense_category_id, e.expense_sub_category_id,
             et.name as expense_type_name, ec.name as expense_category_name, esc.name as expense_sub_category_name
      FROM expenses e
      LEFT JOIN expense_type et ON e.expense_type_id = et.id
      LEFT JOIN expense_category ec ON e.expense_category_id = ec.id
      LEFT JOIN expense_sub_category esc ON e.expense_sub_category_id = esc.id
      WHERE e.date BETWEEN ? AND ?
    `;
    
    const [rows] = await pool.query(query, [startDate, endDate]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expenses by budget period:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expenses by budget period' });
  }
});

// Sync expenses with budget
app.post('/api/budgets/sync-expenses', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      res.status(400).json({ status: 'error', message: 'Year and month are required' });
      return;
    }
    
    // Check if there's a budget for this period
    const [budgets] = await pool.query(
      'SELECT id FROM budgets WHERE year = ? AND month = ?',
      [year, month]
    );
    
    if (Array.isArray(budgets) && budgets.length === 0) {
      res.status(404).json({ status: 'error', message: 'Budget not found for the specified period' });
      return;
    }
    
    // @ts-ignore
    const budgetId = budgets[0].id;
    
    // Reset all spent amounts to zero
    await pool.query(
      'UPDATE budget_categories SET spent = 0 WHERE budget_id = ?',
      [budgetId]
    );
    
    await pool.query(
      'UPDATE budgets SET total_spent = 0 WHERE id = ?',
      [budgetId]
    );
    
    // Get all expenses for this period
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    
    const [expenses] = await pool.query(
      'SELECT category, SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category',
      [startDate, endDate]
    );
    
    if (Array.isArray(expenses)) {
      let totalSpent = 0;
      
      // Update each category
      for (const expense of expenses) {
        // @ts-ignore
        const { category, total } = expense;
        const parsedTotal = parseFloat(total);
        
        // Update the category spent amount
        await pool.query(
          `UPDATE budget_categories 
           SET spent = spent + ? 
           WHERE budget_id = ? AND category = ?`,
          [parsedTotal, budgetId, category]
        );
        
        totalSpent += parsedTotal;
      }
      
      // Update the total spent in the budget
      await pool.query(
        'UPDATE budgets SET total_spent = ? WHERE id = ?',
        [totalSpent, budgetId]
      );
    }
    
    res.json({ status: 'success', message: 'Expenses synchronized with budget successfully' });
  } catch (error) {
    console.error('Error syncing expenses with budget:', error);
    res.status(500).json({ status: 'error', message: 'Failed to sync expenses with budget' });
  }
});

// Get all budget periods with expense integration
app.get('/api/budgets', async (req: Request, res: Response) => {
  try {
    const includeExpenses = req.query.includeExpenses === 'true';
    
    // Get all budget periods
    const [budgets] = await pool.query(`
      SELECT id, month, year, total_allocated, total_spent, created_at, updated_at
      FROM budgets
      ORDER BY year DESC, month DESC
    `);
    
    if (!Array.isArray(budgets)) {
      res.json([]);
      return;
    }
    
    const result = [];
    
    for (const budget of budgets) {
      // @ts-ignore
      const { id, month, year } = budget;
      
      // Get categories for this budget
      const [categories] = await pool.query(`
        SELECT id, category, allocated, spent
        FROM budget_categories
        WHERE budget_id = ?
      `, [id]);
      
      // Calculate additional fields for each category
      const processedCategories = Array.isArray(categories) ? categories.map(category => {
        // @ts-ignore
        const allocated = parseFloat(category.allocated);
        // @ts-ignore
        const spent = parseFloat(category.spent);
        const remaining = allocated - spent;
        const percentageUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
        
        return {
          // @ts-ignore
          ...category,
          allocated,
          spent,
          remaining,
          percentageUsed
        };
      }) : [];
      
      // Add to results
      result.push({
        ...budget,
        // @ts-ignore
        totalAllocated: parseFloat(budget.total_allocated),
        // @ts-ignore
        totalSpent: parseFloat(budget.total_spent),
        categories: processedCategories
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch budget periods' });
  }
});

// Get specific budget period by ID with expense integration
app.get('/api/budgets/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const includeExpenses = req.query.includeExpenses === 'true';
    
    // Get the budget
    const [budgets] = await pool.query(`
      SELECT id, month, year, total_allocated, total_spent, created_at, updated_at
      FROM budgets
      WHERE id = ?
    `, [id]);
    
    if (!Array.isArray(budgets) || budgets.length === 0) {
      res.status(404).json({ status: 'error', message: 'Budget not found' });
      return;
    }
    
    const budget = budgets[0];
    
    // Get categories for this budget
    const [categories] = await pool.query(`
      SELECT id, category, allocated, spent
      FROM budget_categories
      WHERE budget_id = ?
    `, [id]);
    
    // Calculate additional fields for each category
    const processedCategories = Array.isArray(categories) ? categories.map(category => {
      // @ts-ignore
      const allocated = parseFloat(category.allocated);
      // @ts-ignore
      const spent = parseFloat(category.spent);
      const remaining = allocated - spent;
      const percentageUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
      
      return {
        // @ts-ignore
        ...category,
        allocated,
        spent,
        remaining,
        percentageUsed
      };
    }) : [];
    
    // Get related expenses if requested
    let expenses = [];
    if (includeExpenses) {
      // @ts-ignore
      const { year, month } = budget;
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year as string), parseInt(month as string), 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
      
      const [expenseRows] = await pool.query(`
        SELECT id, amount, category, date, description, 
               expense_type_id, expense_category_id, expense_sub_category_id,
               expense_type_name, expense_category_name, expense_sub_category_name
        FROM expenses
        LEFT JOIN expense_type ON expenses.expense_type_id = expense_type.id
        LEFT JOIN expense_category ON expenses.expense_category_id = expense_category.id
        LEFT JOIN expense_sub_category ON expenses.expense_sub_category_id = expense_sub_category.id
        WHERE date BETWEEN ? AND ?
      `, [startDate, endDate]);
      
      expenses = getSafeRows(expenseRows);
    }
    
    // Prepare the response
    const result = {
      ...budget,
      // @ts-ignore
      totalAllocated: parseFloat(budget.total_allocated),
      // @ts-ignore
      totalSpent: parseFloat(budget.total_spent),
      categories: processedCategories,
      expenses: includeExpenses ? expenses : undefined
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching budget by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch budget' });
  }
});

// Add a new budget period
app.post('/api/budgets', async (req: Request, res: Response) => {
  try {
    const { month, year, totalAllocated = 0, categories = [] } = req.body;
    
    // Validate required fields
    if (!month || !year) {
      res.status(400).json({ status: 'error', message: 'Month and year are required' });
      return;
    }
    
    // Check if budget already exists for this period
    const [existing] = await pool.query(
      'SELECT id FROM budgets WHERE month = ? AND year = ?',
      [month, year]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(400).json({ status: 'error', message: 'Budget already exists for this period' });
      return;
    }
    
    // Generate a budget ID
    const budgetId = `budget-${year}-${month}`;
    
    // Create the budget
    const [result] = await pool.query(
      'INSERT INTO budgets (id, month, year, total_allocated) VALUES (?, ?, ?, ?)',
      [budgetId, month, year, totalAllocated]
    );
    
    // Add categories if provided
    if (categories.length > 0) {
      for (const category of categories) {
        const categoryId = `bc-${category.category.toLowerCase().replace(/\s+/g, '-')}-${year}-${month}`;
        await pool.query(
          'INSERT INTO budget_categories (id, budget_id, category, allocated) VALUES (?, ?, ?, ?)',
          [categoryId, budgetId, category.category, category.allocated]
        );
      }
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Budget created successfully',
      id: budgetId
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create budget' });
  }
});

// Update an existing budget period
app.put('/api/budgets/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { totalAllocated } = req.body;
    
    // Update the budget
    const [result] = await pool.query(
      'UPDATE budgets SET total_allocated = ? WHERE id = ?',
      [totalAllocated, id]
    );
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Budget not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update budget' });
  }
});

// Delete a budget period
app.delete('/api/budgets/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    // Categories will be deleted automatically due to ON DELETE CASCADE
    const [result] = await pool.query('DELETE FROM budgets WHERE id = ?', [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Budget not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete budget' });
  }
});

// Add a category to a budget
app.post('/api/budgets/:budgetId/categories', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { budgetId } = req.params;
    const { category, allocated } = req.body;
    
    // Check if budget exists
    const [budgets] = await pool.query('SELECT id, year, month FROM budgets WHERE id = ?', [budgetId]);
    
    if (!Array.isArray(budgets) || budgets.length === 0) {
      res.status(404).json({ status: 'error', message: 'Budget not found' });
      return;
    }
    
    // @ts-ignore
    const { year, month } = budgets[0];
    
    // Check if category already exists in this budget
    const [existing] = await pool.query(
      'SELECT id FROM budget_categories WHERE budget_id = ? AND category = ?',
      [budgetId, category]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(400).json({ status: 'error', message: 'Category already exists in this budget' });
      return;
    }
    
    // Generate a category ID
    const categoryId = `bc-${category.toLowerCase().replace(/\s+/g, '-')}-${year}-${month}`;
    
    // Add the category
    await pool.query(
      'INSERT INTO budget_categories (id, budget_id, category, allocated) VALUES (?, ?, ?, ?)',
      [categoryId, budgetId, category, allocated]
    );
    
    // Update the total allocated in the budget
    await pool.query(
      'UPDATE budgets SET total_allocated = total_allocated + ? WHERE id = ?',
      [allocated, budgetId]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Budget category added successfully',
      id: categoryId
    });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add budget category' });
  }
});

// Update a category in a budget
app.put('/api/budgets/:budgetId/categories/:categoryId', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { budgetId, categoryId } = req.params;
    const { allocated } = req.body;
    
    // Get the current allocation to calculate the difference
    const [categories] = await pool.query(
      'SELECT allocated FROM budget_categories WHERE id = ? AND budget_id = ?',
      [categoryId, budgetId]
    );
    
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(404).json({ status: 'error', message: 'Budget category not found' });
      return;
    }
    
    // @ts-ignore
    const oldAllocated = parseFloat(categories[0].allocated);
    const difference = allocated - oldAllocated;
    
    // Update the category
    const [result] = await pool.query(
      'UPDATE budget_categories SET allocated = ? WHERE id = ? AND budget_id = ?',
      [allocated, categoryId, budgetId]
    );
    
    // Update the total allocated in the budget
    await pool.query(
      'UPDATE budgets SET total_allocated = total_allocated + ? WHERE id = ?',
      [difference, budgetId]
    );
    
    res.json({ status: 'success', message: 'Budget category updated successfully' });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update budget category' });
  }
});

// Delete a category from a budget
app.delete('/api/budgets/:budgetId/categories/:categoryId', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { budgetId, categoryId } = req.params;
    
    // Get the current allocation to subtract from the total
    const [categories] = await pool.query(
      'SELECT allocated FROM budget_categories WHERE id = ? AND budget_id = ?',
      [categoryId, budgetId]
    );
    
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(404).json({ status: 'error', message: 'Budget category not found' });
      return;
    }
    
    // @ts-ignore
    const allocated = parseFloat(categories[0].allocated);
    
    // Delete the category
    const [result] = await pool.query(
      'DELETE FROM budget_categories WHERE id = ? AND budget_id = ?',
      [categoryId, budgetId]
    );
    
    // Update the total allocated in the budget
    await pool.query(
      'UPDATE budgets SET total_allocated = total_allocated - ? WHERE id = ?',
      [allocated, budgetId]
    );
    
    res.json({ status: 'success', message: 'Budget category deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete budget category' });
  }
});

// FAMILY API ENDPOINTS - Enhanced and expanded

// Get all families
app.get('/api/families', async (req: Request, res: Response) => {
  try {
    const query = `SELECT family_id, name FROM family`;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch families' });
  }
});

// Get family by ID
app.get('/api/families/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const query = `SELECT family_id, name FROM family WHERE family_id = ?`;
    const [rows] = await pool.query(query, [id]);
    
    if (Array.isArray(rows) && rows.length === 0) {
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
app.post('/api/families', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `INSERT INTO family (name) VALUES (?)`;
    const [result] = await pool.query(query, [name]);
    
    const resultWithInsertId = result as mysql.ResultSetHeader;
    const id = resultWithInsertId.insertId;
    
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
app.put('/api/families/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `UPDATE family SET name = ? WHERE family_id = ?`;
    const [result] = await pool.query(query, [name, id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
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
app.delete('/api/families/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if family has members first
    const [memberCheck] = await pool.query('SELECT COUNT(*) as memberCount FROM family_members WHERE family_id = ?', [id]);
    
    // @ts-ignore
    if (Array.isArray(memberCheck) && memberCheck[0].memberCount > 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family with existing members. Remove members first.' 
      });
      return;
    }
    
    const query = 'DELETE FROM family WHERE family_id = ?';
    const [result] = await pool.query(query, [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
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
app.get('/api/family/members', async (req: Request, res: Response) => {
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
    res.json(rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family members' });
  }
});

app.get('/api/family/members/:id', async (req: Request<ParamsDictionary>, res: Response) => {
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
    
    if (Array.isArray(rows) && rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family member by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family member' });
  }
});

app.post('/api/family/members', async (req: Request, res: Response) => {
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
    
    const resultWithInsertId = result as mysql.ResultSetHeader;
    const id = resultWithInsertId.insertId;
    
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

app.put('/api/family/members/:id', async (req: Request<ParamsDictionary>, res: Response) => {
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
    
    // @ts-ignore
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
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member updated successfully' });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update family member' });
  }
});

app.delete('/api/family/members/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if this is a default member
    const [memberCheck] = await pool.query('SELECT is_default, family_id FROM family_members WHERE id = ?', [id]);
    
    if (Array.isArray(memberCheck) && memberCheck.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    // @ts-ignore
    if (memberCheck[0].is_default) {
      res.status(400).json({ status: 'error', message: 'Cannot delete the default family member' });
      return;
    }
    
    // Check if member has any transactions
    const [incomeCheck] = await pool.query('SELECT COUNT(*) as count FROM income WHERE family_member_id = ?', [id]);
    const [expenseCheck] = await pool.query('SELECT COUNT(*) as count FROM expenses WHERE family_member_id = ?', [id]);
    
    // @ts-ignore
    if ((incomeCheck[0].count > 0) || (expenseCheck[0].count > 0)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family member with existing transactions' 
      });
      return;
    }
    
    const query = 'DELETE FROM family_members WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete family member' });
  }
});

// Get reports data (monthly summaries)
app.get('/api/reports/monthly', async (req: Request, res: Response) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(amount) as total
      FROM income
    `;
    
    let incomeRows, expenseRows;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                LIMIT 12`;
      const [incomeResult] = await pool.query(query, [familyId]);
      
      // Fix: Check if the result is an array before assigning
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      
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
      
      const [expenseResult] = await pool.query(query, [familyId]);
      // Fix: Check if the result is an array before assigning
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
      
      res.json({ income: incomeRows, expenses: expenseRows });
    } else {
      query += `
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [incomeResult] = await pool.query(query);
      // Fix: Check if the result is an array before assigning
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      
      query = `
        SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          SUM(amount) as total
        FROM expenses
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [expenseResult] = await pool.query(query);
      // Fix: Check if the result is an array before assigning
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
      
      res.json({ income: incomeRows, expenses: expenseRows });
    }
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monthly reports' });
  }
});

// Get weekly spending patterns
app.get('/api/reports/weekly', async (req: Request, res: Response) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        DAYOFWEEK(date) as day_of_week,
        SUM(amount) as total
      FROM expenses
    `;
    
    let rows;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [result] = await pool.query(query, [familyId]);
      // Fix: Check if the result is an array before assigning
      rows = isResultArray(result) ? result : [];
      res.json(rows);
    } else {
      query += ` GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [result] = await pool.query(query);
      // Fix: Check if the result is an array before assigning
      rows = isResultArray(result) ? result : [];
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching weekly spending patterns:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch weekly spending patterns' });
  }
});

// API Documentation endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    status: 'success', 
    message: 'Welcome to FinTrack API',
    endpoints: {
      docs: '/api/docs',
      test: '/api/test',
      income: '/api/income',
      incomeTypes: '/api/income/types',
      incomeCategories: '/api/income/categories',
      incomeSubcategories: '/api/income/subcategories/by-category/:categoryId',
      expenses: '/api/expenses',
      expenseTypes: '/api/expenses/types',
      expenseCategories: '/api/expenses/categories/by-type/:typeId',
      expenseSubcategories: '/api/expenses/subcategories/by-category/:categoryId',
      families: '/api/families',
      familyMembers: '/api/family/members',
      reports: ['/api/reports/monthly', '/api/reports/weekly']
    }
  });
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api/docs`);
});

export default app;
