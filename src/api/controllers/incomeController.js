
import pool from '../db/db.js';
import { isResultArray, getUuidFromResult } from '../utils/queryHelpers.js';

// Get all income categories
export const getAllIncomeCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_category');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income categories' });
  }
};

// Get all income types
export const getAllIncomeTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM income_type');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching income types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income types' });
  }
};

// Get all incomes
export const getAllIncomes = async (req, res) => {
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
};

// Get income by ID
export const getIncomeById = async (req, res) => {
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
};

// Add new income
export const createIncome = async (req, res) => {
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
};

// Update income
export const updateIncome = async (req, res) => {
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
};

// Delete income
export const deleteIncome = async (req, res) => {
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
};

// Get income categories by type
export const getCategoriesByType = async (req, res) => {
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
};

// Get income subcategories by category
export const getSubcategoriesByCategory = async (req, res) => {
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
};
