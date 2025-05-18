
import pool from '../db/db.js';
import { getSafeRows } from '../utils/queryHelpers.js';

// Get all wallet types
export const getAllWalletTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wallet_type');
    res.json(getSafeRows(rows));
  } catch (error) {
    console.error('Error fetching wallet types:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallet types' });
  }
};

// Get wallet categories by type ID
export const getWalletCategoriesByType = async (req, res) => {
  try {
    const { typeId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM wallet_category WHERE wallet_type_id = ?',
      [typeId]
    );
    res.json(getSafeRows(rows));
  } catch (error) {
    console.error(`Error fetching wallet categories for type ${req.params.typeId}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallet categories' });
  }
};

// Get wallet subcategories by category ID
export const getWalletSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM wallet_sub_category WHERE wallet_category_id = ?',
      [categoryId]
    );
    res.json(getSafeRows(rows));
  } catch (error) {
    console.error(`Error fetching wallet subcategories for category ${req.params.categoryId}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallet subcategories' });
  }
};

// Create a new wallet type
export const createWalletType = async (req, res) => {
  try {
    const { name, is_expense } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO wallet_type (name, is_expense) VALUES (?, ?)',
      [name, is_expense]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Wallet type created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating wallet type:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create wallet type' });
  }
};

// Create a new wallet category
export const createWalletCategory = async (req, res) => {
  try {
    const { name, wallet_type_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO wallet_category (name, wallet_type_id) VALUES (?, ?)',
      [name, wallet_type_id]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Wallet category created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating wallet category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create wallet category' });
  }
};

// Create a new wallet subcategory
export const createWalletSubcategory = async (req, res) => {
  try {
    const { name, wallet_category_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO wallet_sub_category (name, wallet_category_id) VALUES (?, ?)',
      [name, wallet_category_id]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Wallet subcategory created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating wallet subcategory:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create wallet subcategory' });
  }
};
