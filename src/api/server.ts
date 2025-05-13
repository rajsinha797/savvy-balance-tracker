
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const app = express();
const port = 3001;

app.use(cors());
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

// Family members API endpoints
app.get('/api/family/members', async (req: Request, res: Response) => {
  try {
    const query = `SELECT id, family_id, name, relationship, is_default FROM family_members`;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family members' });
  }
});

app.get('/api/family/members/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const query = `SELECT id, family_id, name, relationship, is_default FROM family_members WHERE id = ?`;
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
    const { name, relationship, is_default } = req.body;
    
    // If this is set as default, unset any previous defaults
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = 1');
    }
    
    const query = `
      INSERT INTO family_members (family_id, name, relationship, is_default)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [1, name, relationship, is_default]);
    
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
    const { name, relationship, is_default } = req.body;
    
    // If this is set as default, unset any previous defaults
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = 1');
    }
    
    const query = `
      UPDATE family_members
      SET name = ?, relationship = ?, is_default = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [name, relationship, is_default, id]);
    
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
    const [defaultCheck] = await pool.query('SELECT is_default FROM family_members WHERE id = ?', [id]);
    if (Array.isArray(defaultCheck) && defaultCheck.length > 0) {
      // @ts-ignore
      if (defaultCheck[0].is_default) {
        res.status(400).json({ status: 'error', message: 'Cannot delete the default family member' });
        return;
      }
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
