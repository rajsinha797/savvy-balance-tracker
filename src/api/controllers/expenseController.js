import pool from '../db/db.js';
import { getSafeRows } from '../utils/queryHelpers.js';

// Get all expenses with detailed category info
export const getAllExpenses = async (req, res) => {
  try {
    const familyMemberId = req.query.family_member_id;
    
    // Updated query to include expense_type, expense_category and expense_sub_category names
    let query = `
      SELECT e.id, e.amount, e.date, e.description,
             et.name AS expense_type_name,
             ec.name AS expense_category_name,
             esc.name AS expense_sub_category_name,
             fm.name AS family_member,
             e.expense_type_id, e.expense_category_id, e.expense_sub_category_id,
             e.family_member_id
      FROM expenses e
      LEFT JOIN expense_type et ON e.expense_type_id = et.id
      LEFT JOIN expense_category ec ON e.expense_category_id = ec.id
      LEFT JOIN expense_sub_category esc ON e.expense_sub_category_id = esc.id
      LEFT JOIN family_members fm ON e.family_member_id = fm.id
    `;
    
    if (familyMemberId) {
      query += ` WHERE e.family_member_id = ?
                ORDER BY e.date DESC`;
      const [result] = await pool.query(query, [familyMemberId]);
      res.json(getSafeRows(result));
    } else {
      query += ` ORDER BY e.date DESC`;
      const [result] = await pool.query(query);
      res.json(getSafeRows(result));
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expenses' });
  }
};

// Add new expense
export const createExpense = async (req, res) => {
  try {
    const { 
      amount,
      expense_type_id,
      expense_category_id,
      expense_sub_category_id,
      date,
      description,
      family_member_id 
    } = req.body;
    
    // First check if the table has a category column
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM expenses WHERE Field = 'category'
    `);
    
    let query;
    let params;
    
    // If the category column exists, include it in the query with a default value
    if (columns && columns.length > 0) {
      query = `
        INSERT INTO expenses (
          expense_type_id,
          expense_category_id,
          expense_sub_category_id,
          amount,
          date,
          description,
          family_member_id,
          category
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Use the expense_category_name as the category if possible, or default to 'Expense'
      const categoryName = 'Expense'; // Default category
      params = [
        expense_type_id,
        expense_category_id,
        expense_sub_category_id,
        amount, 
        date, 
        description,
        family_member_id || null,
        categoryName
      ];
    } else {
      // Otherwise just use the columns we know exist
      query = `
        INSERT INTO expenses (
          expense_type_id,
          expense_category_id,
          expense_sub_category_id,
          amount,
          date,
          description,
          family_member_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      params = [
        expense_type_id,
        expense_category_id,
        expense_sub_category_id,
        amount, 
        date, 
        description,
        family_member_id || null
      ];
    }
    
    const [result] = await pool.query(query, params);
    
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
    const { 
      amount,
      expense_type_id,
      expense_category_id,
      expense_sub_category_id,
      date,
      description,
      family_member_id 
    } = req.body;
    
    const query = `
      UPDATE expenses
      SET expense_type_id = ?, 
          expense_category_id = ?, 
          expense_sub_category_id = ?, 
          amount = ?, 
          date = ?, 
          description = ?,
          family_member_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      expense_type_id,
      expense_category_id,
      expense_sub_category_id,
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
    
    const query = 'DELETE FROM expenses WHERE id = ?';
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

// Get expense categories (legacy, kept for backward compatibility)
export const getExpenseCategories = async (req, res) => {
  try {
    // First try to get from expense_type table (new schema)
    const [types] = await pool.query('SELECT id, name FROM expense_type');
    
    if (getSafeRows(types).length > 0) {
      res.json(getSafeRows(types));
      return;
    }
    
    // Fallback to legacy table
    try {
      const [categories] = await pool.query('SELECT id, name FROM expense_categories');
      res.json(getSafeRows(categories));
    } catch (legacyError) {
      console.error('Error with legacy expense categories:', legacyError);
      // If legacy table doesn't exist, return empty array
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch expense categories',
      error: error.message
    });
  }
};
