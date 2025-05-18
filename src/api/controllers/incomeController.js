import pool from '../db/db.js';
import { getSafeRows } from '../utils/queryHelpers.js';

// Get all income categories - legacy function but updated to use new table
export const getAllIncomeCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id as category_id, name FROM income_category');
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
    const familyMemberId = req.query.family_member_id;
    
    let query = `
      SELECT i.id as id, i.amount, i.date, i.description, 
             it.name as income_type_name,
             ic.name as income_category_name,
             isc.name as income_sub_category_name,
             i.income_type_id, i.income_category_id, i.income_sub_category_id,
             fm.name as family_member, i.family_member_id, i.wallet_id,
             w.name AS wallet_name
      FROM income i
      LEFT JOIN income_type it ON i.income_type_id = it.id
      LEFT JOIN income_category ic ON i.income_category_id = ic.id
      LEFT JOIN income_sub_category isc ON i.income_sub_category_id = isc.id
      LEFT JOIN family_members fm ON i.family_member_id = fm.id
      LEFT JOIN wallet w ON i.wallet_id = w.id
    `;
    
    if (familyMemberId) {
      query += ` WHERE i.family_member_id = ?
                ORDER BY i.date DESC`;
      const [rows] = await pool.query(query, [familyMemberId]);
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
      SELECT i.id as id, i.amount, i.date, i.description,
             it.name as income_type_name, 
             ic.name as income_category_name,
             ist.name as income_sub_category_name,
             i.income_type_id, i.income_category_id, i.income_sub_category_id,
             i.family_member_id, i.wallet_id,
             w.name AS wallet_name
      FROM income i
      LEFT JOIN income_type it ON i.income_type_id = it.id
      LEFT JOIN income_category ic ON i.income_category_id = ic.id
      LEFT JOIN income_sub_category ist ON i.income_sub_category_id = ist.id
      LEFT JOIN wallet w ON i.wallet_id = w.id
      WHERE i.id = ?
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
      description, 
      date,
      family_member_id,
      wallet_id  // Added wallet_id
    } = req.body;

    const query = `
      INSERT INTO income (
        income_type_id,
        income_category_id,
        income_sub_category_id,
        amount, 
        date, 
        description, 
        family_member_id,
        wallet_id,
        category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Income')
    `;
    
    const params = [
      income_type_id,
      income_category_id,
      income_sub_category_id,
      amount, 
      date, 
      description,
      family_member_id || null,
      wallet_id || null,
      'Income'
    ];
    
    const [result] = await pool.query(query, params);
    
    // If a wallet was selected, update the wallet amount
    if (wallet_id) {
      // Get wallet details
      const [walletRows] = await pool.query('SELECT * FROM wallet WHERE id = ?', [wallet_id]);
      const wallet = getSafeRows(walletRows)[0];
      
      if (wallet) {
        // Update wallet amount (increase for income)
        const newAmount = parseFloat(wallet.amount) + parseFloat(amount);
        await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [newAmount, wallet_id]);
      }
    }
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Income added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add income', error: error.message });
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
      description, 
      date,
      family_member_id,
      wallet_id  // Added wallet_id
    } = req.body;
    
    // First, get the existing income to handle wallet changes
    const [existingIncome] = await pool.query('SELECT amount, wallet_id FROM income WHERE id = ?', [id]);
    const oldIncome = getSafeRows(existingIncome)[0];
    
    // Handle wallet updates
    if (oldIncome) {
      // If wallet is changing or amount is changing, update wallet balances
      if (oldIncome.wallet_id !== wallet_id || parseFloat(oldIncome.amount) !== parseFloat(amount)) {
        // If there was a previous wallet, update its amount
        if (oldIncome.wallet_id) {
          const [oldWalletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [oldIncome.wallet_id]);
          const oldWallet = getSafeRows(oldWalletRows)[0];
          
          if (oldWallet) {
            // Subtract the old income amount from the wallet (reverse the income)
            const restoredAmount = parseFloat(oldWallet.amount) - parseFloat(oldIncome.amount);
            await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [restoredAmount, oldIncome.wallet_id]);
          }
        }
        
        // If there's a new wallet, update its amount
        if (wallet_id) {
          const [newWalletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [wallet_id]);
          const newWallet = getSafeRows(newWalletRows)[0];
          
          if (newWallet) {
            // Add the new income amount to the wallet
            const updatedAmount = parseFloat(newWallet.amount) + parseFloat(amount);
            await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [updatedAmount, wallet_id]);
          }
        }
      }
    }
    
    const query = `
      UPDATE income
      SET income_type_id = ?,
          income_category_id = ?,
          income_sub_category_id = ?,
          amount = ?, 
          date = ?, 
          description = ?,
          family_member_id = ?,
          wallet_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      income_type_id,
      income_category_id,
      income_sub_category_id,
      amount, 
      date, 
      description,
      family_member_id || null,
      wallet_id || null,
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
    
    // First, get the existing income to handle wallet changes
    const [existingIncome] = await pool.query('SELECT amount, wallet_id FROM income WHERE id = ?', [id]);
    const oldIncome = getSafeRows(existingIncome)[0];
    
    // If there was a wallet, update its amount
    if (oldIncome && oldIncome.wallet_id) {
      const [walletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [oldIncome.wallet_id]);
      const wallet = getSafeRows(walletRows)[0];
      
      if (wallet) {
        // Subtract the income amount from the wallet (reverse the income)
        const restoredAmount = parseFloat(wallet.amount) - parseFloat(oldIncome.amount);
        await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [restoredAmount, oldIncome.wallet_id]);
      }
    }
    
    const query = 'DELETE FROM income WHERE id = ?';
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
    
    const result = getSafeRows(rows);
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
    
    const result = getSafeRows(rows);
    res.json(result);
  } catch (error) {
    console.error(`Error fetching income subcategories for category ${req.params.categoryId}:`, error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch income subcategories' });
  }
};

// Get available wallets
export const getAvailableWallets = async (req, res) => {
  try {
    const query = `
      SELECT w.id, w.name, w.amount, wt.name AS type_name, wt.is_expense
      FROM wallet w
      JOIN wallet_type wt ON w.wallet_type_id = wt.id
      ORDER BY w.name
    `;
    
    const [result] = await pool.query(query);
    res.json(getSafeRows(result));
  } catch (error) {
    console.error('Error fetching available wallets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch available wallets' });
  }
};
