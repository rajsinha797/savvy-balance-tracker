import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'success', message: 'Database connected successfully', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database' });
  }
});

// Get all income categories
app.get('/api/income/categories', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_category');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories' });
  }
});

// Get all incomes
app.get('/api/income', async (req: Request, res: Response) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT i.income_id as id, i.amount, i.date, i.description, ic.name as category, 
             fm.name as family_member, i.family_member_id
      FROM income i
      JOIN income_category ic ON i.category_id = ic.category_id
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
    const query = `
      SELECT i.income_id as id, i.amount, i.date, i.description, ic.name as category,
             i.family_member_id
      FROM income i
      JOIN income_category ic ON i.category_id = ic.category_id
      WHERE i.income_id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    
    if (Array.isArray(rows) && rows.length === 0) {
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
app.post('/api/income', async (req: Request, res: Response) => {
  try {
    const { amount, category_id, date, description, family_member_id } = req.body;
    
    // Set default values for now
    const family_id = 1; // Default family ID
    const user_id = 1;  // Default user ID
    
    const query = `
      INSERT INTO income (family_id, user_id, category_id, amount, date, description, family_member_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      family_id, 
      user_id, 
      category_id, 
      amount, 
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

// Update income
app.put('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category_id, date, description, family_member_id } = req.body;
    
    const query = `
      UPDATE income
      SET category_id = ?, amount = ?, date = ?, description = ?, family_member_id = ?
      WHERE income_id = ?
    `;
    
    const [result] = await pool.query(query, [
      category_id, 
      amount, 
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
    
    const query = 'DELETE FROM income WHERE income_id = ?';
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

// Get all expenses
app.get('/api/expenses', async (req: Request, res: Response) => {
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
app.post('/api/expenses', async (req: Request, res: Response) => {
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
    
    const resultWithInsertId = result as mysql.ResultSetHeader;
    const id = resultWithInsertId.insertId;
    
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
app.put('/api/expenses/:id', async (req: Request<ParamsDictionary>, res: Response) => {
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
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
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
app.delete('/api/expenses/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM expenses WHERE expense_id = ?';
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
      res.json({ income: incomeRows, expenses: expenseRows });
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
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query, [familyId]);
      res.json(rows);
    } else {
      query += ` GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query);
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
      incomeCategories: '/api/income/categories',
      expenses: '/api/expenses',
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
