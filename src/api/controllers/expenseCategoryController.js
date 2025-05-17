
import pool from '../db/db.js';
import { isResultArray, getSafeRows } from '../utils/queryHelpers.js';

/**
 * Get all expense categories (legacy)
 */
export const getAllExpenseCategories = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT id, name FROM expense_categories');
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense categories' });
  }
};

/**
 * Get all expense types
 */
export const getAllExpenseTypes = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT id, name FROM expense_type');
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense types' });
  }
};

/**
 * Get expense categories by type
 */
export const getExpenseCategoriesByType = async (req, res) => {
  try {
    const typeId = req.params.typeId;
    
    const [result] = await pool.query(
      'SELECT id, expense_type_id, name FROM expense_category WHERE expense_type_id = ?',
      [typeId]
    );
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense categories by type:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense categories by type' });
  }
};

/**
 * Get expense subcategories by category
 */
export const getExpenseSubcategoriesByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const [result] = await pool.query(
      'SELECT id, expense_category_id, name FROM expense_sub_category WHERE expense_category_id = ?',
      [categoryId]
    );
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expense subcategories by category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch expense subcategories by category' });
  }
};
