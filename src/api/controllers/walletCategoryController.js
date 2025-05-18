
import pool from '../db/db.js';
import { getSafeRows } from '../utils/queryHelpers.js';

// Get all wallet types
export const getAllWalletTypes = async (req, res) => {
  try {
    const query = `SELECT id, name, is_expense FROM wallet_type`;
    const [result] = await pool.query(query);
    res.json(getSafeRows(result));
  } catch (error) {
    console.error('Error fetching wallet types:', error);
    
    // Return dummy data in case of error
    const dummyData = [
      { id: 1, name: 'Spending', is_expense: 1 },
      { id: 2, name: 'Savings', is_expense: 0 },
      { id: 3, name: 'Debt', is_expense: 1 }
    ];
    
    res.json(dummyData);
  }
};

// Get wallet categories by type
export const getWalletCategoriesByType = async (req, res) => {
  try {
    const { typeId } = req.params;
    
    const query = `
      SELECT id, wallet_type_id, name
      FROM wallet_category
      WHERE wallet_type_id = ?
    `;
    
    const [result] = await pool.query(query, [typeId]);
    res.json(getSafeRows(result));
  } catch (error) {
    console.error('Error fetching wallet categories by type:', error);
    
    // Return dummy data in case of error
    const typeId = parseInt(req.params.typeId);
    let dummyData = [];
    
    if (typeId === 1) { // Spending
      dummyData = [
        { id: 1, wallet_type_id: 1, name: 'Cash' },
        { id: 2, wallet_type_id: 1, name: 'Credit' },
        { id: 3, wallet_type_id: 1, name: 'Digital' },
        { id: 4, wallet_type_id: 1, name: 'Custom' }
      ];
    } else if (typeId === 2) { // Savings
      dummyData = [
        { id: 5, wallet_type_id: 2, name: 'Emergency Fund' },
        { id: 6, wallet_type_id: 2, name: 'Trip' },
        { id: 7, wallet_type_id: 2, name: 'House' },
        { id: 8, wallet_type_id: 2, name: 'Custom' }
      ];
    } else if (typeId === 3) { // Debt
      dummyData = [
        { id: 9, wallet_type_id: 3, name: 'Loan' },
        { id: 10, wallet_type_id: 3, name: 'Personal Debt' },
        { id: 11, wallet_type_id: 3, name: 'Car Loan' },
        { id: 12, wallet_type_id: 3, name: 'Custom' }
      ];
    }
    
    res.json(dummyData);
  }
};

// Get wallet subcategories by category
export const getWalletSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const query = `
      SELECT id, wallet_category_id, name
      FROM wallet_sub_category
      WHERE wallet_category_id = ?
    `;
    
    const [result] = await pool.query(query, [categoryId]);
    res.json(getSafeRows(result));
  } catch (error) {
    console.error('Error fetching wallet subcategories by category:', error);
    
    // Return dummy data in case of error
    const categoryId = parseInt(req.params.categoryId);
    let dummyData = [];
    
    // Map some dummy subcategories by category
    if (categoryId === 1) { // Cash
      dummyData = [
        { id: 1, wallet_category_id: 1, name: 'Cash at Home' },
        { id: 2, wallet_category_id: 1, name: 'Wallet Cash' }
      ];
    } else if (categoryId === 2) { // Credit
      dummyData = [
        { id: 3, wallet_category_id: 2, name: 'Credit Card' },
        { id: 4, wallet_category_id: 2, name: 'Store Credit' }
      ];
    } else if (categoryId === 3) { // Digital
      dummyData = [
        { id: 5, wallet_category_id: 3, name: 'Paytm' },
        { id: 6, wallet_category_id: 3, name: 'PhonePe' },
        { id: 7, wallet_category_id: 3, name: 'Google Pay' }
      ];
    } else if (categoryId === 9) { // Loan
      dummyData = [
        { id: 8, wallet_category_id: 9, name: 'Home Loan' }
      ];
    } else if (categoryId === 10) { // Personal Debt
      dummyData = [
        { id: 9, wallet_category_id: 10, name: 'Friend Loan' }
      ];
    } else if (categoryId === 11) { // Car Loan
      dummyData = [
        { id: 10, wallet_category_id: 11, name: 'Car EMI' }
      ];
    }
    
    res.json(dummyData);
  }
};

// Create wallet type
export const createWalletType = async (req, res) => {
  try {
    const { name, is_expense } = req.body;
    
    const query = `
      INSERT INTO wallet_type (name, is_expense)
      VALUES (?, ?)
    `;
    
    const [result] = await pool.query(query, [name, is_expense]);
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Wallet type added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding wallet type:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add wallet type' });
  }
};

// Create wallet category
export const createWalletCategory = async (req, res) => {
  try {
    const { wallet_type_id, name } = req.body;
    
    const query = `
      INSERT INTO wallet_category (wallet_type_id, name)
      VALUES (?, ?)
    `;
    
    const [result] = await pool.query(query, [wallet_type_id, name]);
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Wallet category added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding wallet category:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add wallet category' });
  }
};

// Create wallet subcategory
export const createWalletSubcategory = async (req, res) => {
  try {
    const { wallet_category_id, name } = req.body;
    
    const query = `
      INSERT INTO wallet_sub_category (wallet_category_id, name)
      VALUES (?, ?)
    `;
    
    const [result] = await pool.query(query, [wallet_category_id, name]);
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Wallet subcategory added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding wallet subcategory:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add wallet subcategory' });
  }
};
