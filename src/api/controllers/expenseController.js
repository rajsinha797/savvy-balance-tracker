
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
             e.family_member_id, e.wallet_id,
             w.name AS wallet_name
      FROM expenses e
      LEFT JOIN expense_type et ON e.expense_type_id = et.id
      LEFT JOIN expense_category ec ON e.expense_category_id = ec.id
      LEFT JOIN expense_sub_category esc ON e.expense_sub_category_id = esc.id
      LEFT JOIN family_members fm ON e.family_member_id = fm.id
      LEFT JOIN wallet w ON e.wallet_id = w.id
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
      family_member_id,
      wallet_id
    } = req.body;
    
    const query = `
      INSERT INTO expenses (
        expense_type_id,
        expense_category_id,
        expense_sub_category_id,
        amount,
        date,
        description,
        family_member_id,
        wallet_id,
        category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Expense')
    `;
    
    const params = [
      expense_type_id,
      expense_category_id,
      expense_sub_category_id,
      amount, 
      date, 
      description,
      family_member_id || null,
      wallet_id || null,
      'Expense'
    ];
    
    const [result] = await pool.query(query, params);
    
    // If a wallet was selected, update the wallet amount
    if (wallet_id) {
      // Get wallet details
      const [walletRows] = await pool.query('SELECT * FROM wallet WHERE id = ?', [wallet_id]);
      const wallet = getSafeRows(walletRows)[0];
      
      if (wallet) {
        // Update wallet amount (decrease for expense)
        const newAmount = parseFloat(wallet.amount) - parseFloat(amount);
        await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [newAmount, wallet_id]);
      }
    }
    
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
      family_member_id,
      wallet_id
    } = req.body;
    
    // First, get the existing expense to handle wallet changes
    const [existingExpense] = await pool.query('SELECT amount, wallet_id FROM expenses WHERE id = ?', [id]);
    const oldExpense = getSafeRows(existingExpense)[0];
    
    // Handle wallet updates
    if (oldExpense) {
      // If wallet is changing or amount is changing, update wallet balances
      if (oldExpense.wallet_id !== wallet_id || parseFloat(oldExpense.amount) !== parseFloat(amount)) {
        // If there was a previous wallet, restore its amount
        if (oldExpense.wallet_id) {
          const [oldWalletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [oldExpense.wallet_id]);
          const oldWallet = getSafeRows(oldWalletRows)[0];
          
          if (oldWallet) {
            // Add the old expense amount back to the wallet (reverse the expense)
            const restoredAmount = parseFloat(oldWallet.amount) + parseFloat(oldExpense.amount);
            await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [restoredAmount, oldExpense.wallet_id]);
          }
        }
        
        // If there's a new wallet, update its amount
        if (wallet_id) {
          const [newWalletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [wallet_id]);
          const newWallet = getSafeRows(newWalletRows)[0];
          
          if (newWallet) {
            // Subtract the new expense amount from the wallet
            const updatedAmount = parseFloat(newWallet.amount) - parseFloat(amount);
            await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [updatedAmount, wallet_id]);
          }
        }
      }
    }
    
    const query = `
      UPDATE expenses
      SET expense_type_id = ?, 
          expense_category_id = ?, 
          expense_sub_category_id = ?, 
          amount = ?, 
          date = ?, 
          description = ?,
          family_member_id = ?,
          wallet_id = ?
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
      wallet_id || null,
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
    
    // First, get the existing expense to handle wallet changes
    const [existingExpense] = await pool.query('SELECT amount, wallet_id FROM expenses WHERE id = ?', [id]);
    const oldExpense = getSafeRows(existingExpense)[0];
    
    // If there was a wallet, restore its amount
    if (oldExpense && oldExpense.wallet_id) {
      const [walletRows] = await pool.query('SELECT amount FROM wallet WHERE id = ?', [oldExpense.wallet_id]);
      const wallet = getSafeRows(walletRows)[0];
      
      if (wallet) {
        // Add the expense amount back to the wallet (reverse the expense)
        const restoredAmount = parseFloat(wallet.amount) + parseFloat(oldExpense.amount);
        await pool.query('UPDATE wallet SET amount = ? WHERE id = ?', [restoredAmount, oldExpense.wallet_id]);
      }
    }
    
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
