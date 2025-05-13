
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
    const query = `
      SELECT i.income_id as id, i.amount, i.date, i.description, ic.name as category
      FROM income i
      JOIN income_category ic ON i.category_id = ic.category_id
      ORDER BY i.date DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch incomes' });
  }
});

// Get income by ID
app.get<ParamsDictionary>('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT i.income_id as id, i.amount, i.date, i.description, ic.name as category
      FROM income i
      JOIN income_category ic ON i.category_id = ic.category_id
      WHERE i.income_id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    
    if (Array.isArray(rows) && rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Income not found' });
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
    const { amount, category_id, date, description } = req.body;
    
    // Set default values for now
    const family_id = 1; // Default family ID
    const user_id = 1;  // Default user ID
    
    const query = `
      INSERT INTO income (family_id, user_id, category_id, amount, date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      family_id, 
      user_id, 
      category_id, 
      amount, 
      date, 
      description
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
app.put<ParamsDictionary>('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category_id, date, description } = req.body;
    
    const query = `
      UPDATE income
      SET category_id = ?, amount = ?, date = ?, description = ?
      WHERE income_id = ?
    `;
    
    const [result] = await pool.query(query, [
      category_id, 
      amount, 
      date, 
      description, 
      id
    ]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Income not found' });
    }
    
    res.json({ status: 'success', message: 'Income updated successfully' });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update income' });
  }
});

// Delete income
app.delete<ParamsDictionary>('/api/income/:id', async (req: Request<ParamsDictionary>, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM income WHERE income_id = ?';
    const [result] = await pool.query(query, [id]);
    
    const resultHeader = result as mysql.ResultSetHeader;
    if (resultHeader.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Income not found' });
    }
    
    res.json({ status: 'success', message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete income' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
