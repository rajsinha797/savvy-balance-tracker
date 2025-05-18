
import pool from '../db/db.js';
import { getSafeRows } from '../utils/queryHelpers.js';

// Get all wallets
export const getAllWallets = async (req, res) => {
  try {
    const familyMemberId = req.query.family_member_id;
    
    let query = `
      SELECT w.id, w.name, w.amount, w.date, w.description,
             wt.name AS wallet_type_name, wt.is_expense,
             wc.name AS wallet_category_name,
             wsc.name AS wallet_sub_category_name,
             fm.name AS family_member,
             w.wallet_type_id, w.wallet_category_id, w.wallet_sub_category_id,
             w.family_member_id
      FROM wallet w
      LEFT JOIN wallet_type wt ON w.wallet_type_id = wt.id
      LEFT JOIN wallet_category wc ON w.wallet_category_id = wc.id
      LEFT JOIN wallet_sub_category wsc ON w.wallet_sub_category_id = wsc.id
      LEFT JOIN family_members fm ON w.family_member_id = fm.id
    `;
    
    if (familyMemberId) {
      query += ` WHERE w.family_member_id = ?
                ORDER BY w.date DESC`;
      const [result] = await pool.query(query, [familyMemberId]);
      res.json(getSafeRows(result));
    } else {
      query += ` ORDER BY w.date DESC`;
      const [result] = await pool.query(query);
      res.json(getSafeRows(result));
    }
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallets' });
  }
};

// Get wallet by ID
export const getWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT w.id, w.name, w.amount, w.date, w.description,
             wt.name AS wallet_type_name, wt.is_expense,
             wc.name AS wallet_category_name,
             wsc.name AS wallet_sub_category_name,
             fm.name AS family_member,
             w.wallet_type_id, w.wallet_category_id, w.wallet_sub_category_id,
             w.family_member_id
      FROM wallet w
      LEFT JOIN wallet_type wt ON w.wallet_type_id = wt.id
      LEFT JOIN wallet_category wc ON w.wallet_category_id = wc.id
      LEFT JOIN wallet_sub_category wsc ON w.wallet_sub_category_id = wsc.id
      LEFT JOIN family_members fm ON w.family_member_id = fm.id
      WHERE w.id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    
    if (getSafeRows(result).length === 0) {
      res.status(404).json({ status: 'error', message: 'Wallet not found' });
      return;
    }
    
    res.json(getSafeRows(result)[0]);
  } catch (error) {
    console.error('Error fetching wallet by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallet' });
  }
};

// Add new wallet
export const createWallet = async (req, res) => {
  try {
    const { 
      name,
      amount,
      wallet_type_id,
      wallet_category_id,
      wallet_sub_category_id,
      date,
      description,
      family_member_id 
    } = req.body;
    
    const query = `
      INSERT INTO wallet (
        name,
        amount,
        wallet_type_id,
        wallet_category_id,
        wallet_sub_category_id,
        date,
        description,
        family_member_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      name,
      amount,
      wallet_type_id,
      wallet_category_id,
      wallet_sub_category_id,
      date,
      description,
      family_member_id || null
    ]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Wallet added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add wallet' });
  }
};

// Update wallet
export const updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      amount,
      wallet_type_id,
      wallet_category_id,
      wallet_sub_category_id,
      date,
      description,
      family_member_id 
    } = req.body;
    
    const query = `
      UPDATE wallet
      SET name = ?,
          amount = ?,
          wallet_type_id = ?, 
          wallet_category_id = ?, 
          wallet_sub_category_id = ?, 
          date = ?, 
          description = ?,
          family_member_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [
      name,
      amount,
      wallet_type_id,
      wallet_category_id,
      wallet_sub_category_id,
      date,
      description,
      family_member_id || null,
      id
    ]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Wallet not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Wallet updated successfully' });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update wallet' });
  }
};

// Delete wallet
export const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM wallet WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Wallet not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete wallet' });
  }
};

// Update income and expense controllers to include wallet_id
export const updateIncomeWithWallet = async (req, res, next) => {
  // This is a middleware to update income with wallet_id
  try {
    const { income_id, wallet_id } = req.body;
    
    if (!income_id || !wallet_id) {
      return next();
    }
    
    await pool.query('UPDATE income SET wallet_id = ? WHERE id = ?', [wallet_id, income_id]);
    
    // Move to the next middleware
    next();
  } catch (error) {
    console.error('Error updating income with wallet:', error);
    next(error);
  }
};

export const updateExpenseWithWallet = async (req, res, next) => {
  // This is a middleware to update expense with wallet_id
  try {
    const { expense_id, wallet_id } = req.body;
    
    if (!expense_id || !wallet_id) {
      return next();
    }
    
    await pool.query('UPDATE expenses SET wallet_id = ? WHERE id = ?', [wallet_id, expense_id]);
    
    // Move to the next middleware
    next();
  } catch (error) {
    console.error('Error updating expense with wallet:', error);
    next(error);
  }
};

// Get available wallets for dropdown selection
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
