
import pool from '../db/db.js';
import { isResultArray } from '../utils/queryHelpers.js';

// Get all expenses
export const getAllExpenses = async (req, res) => {
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
};

// Add new expense
export const createExpense = async (req, res) => {
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
};

// Update expense
export const updateExpense = async (req, res) => {
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
};

// Delete expense
export const deleteExpense = async (req, res) => {
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
};

// Get expense categories
export const getExpenseCategories = async (req, res) => {
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
};
