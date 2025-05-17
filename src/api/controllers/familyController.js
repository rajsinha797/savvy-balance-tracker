
import pool from '../db/db.js';
import { isResultArray } from '../utils/queryHelpers.js';

// Get all families
export const getAllFamilies = async (req, res) => {
  try {
    const query = `SELECT family_id, name FROM family`;
    const [rows] = await pool.query(query);
    
    if (!isResultArray(rows)) {
      return res.json([]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch families' });
  }
};

// Get family by ID
export const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT family_id, name FROM family WHERE family_id = ?`;
    const [rows] = await pool.query(query, [id]);
    
    if (!isResultArray(rows) || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family' });
  }
};

// Add a new family
export const createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `INSERT INTO family (name) VALUES (?)`;
    const [result] = await pool.query(query, [name]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Family created successfully',
      id
    });
  } catch (error) {
    console.error('Error adding family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create family' });
  }
};

// Update family
export const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ status: 'error', message: 'Family name is required' });
      return;
    }
    
    const query = `UPDATE family SET name = ? WHERE family_id = ?`;
    const [result] = await pool.query(query, [name, id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family updated successfully' });
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update family' });
  }
};

// Delete family
export const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if family has members first
    const [memberCheck] = await pool.query('SELECT COUNT(*) as memberCount FROM family_members WHERE family_id = ?', [id]);
    
    if (isResultArray(memberCheck) && memberCheck[0].memberCount > 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family with existing members. Remove members first.' 
      });
      return;
    }
    
    const query = 'DELETE FROM family WHERE family_id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete family' });
  }
};

// Get all family members
export const getAllFamilyMembers = async (req, res) => {
  try {
    const familyId = req.query.family_id || 1; // Default to family ID 1 if not specified
    
    const query = `
      SELECT fm.id, fm.family_id, fm.name, fm.relationship, fm.is_default, 
             f.name as family_name
      FROM family_members fm
      JOIN family f ON fm.family_id = f.family_id
      WHERE fm.family_id = ?
    `;
    
    const [rows] = await pool.query(query, [familyId]);
    
    if (!isResultArray(rows)) {
      return res.json([]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family members' });
  }
};

// Get family member by ID
export const getFamilyMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT fm.id, fm.family_id, fm.name, fm.relationship, fm.is_default,
             f.name as family_name
      FROM family_members fm
      JOIN family f ON fm.family_id = f.family_id
      WHERE fm.id = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (!isResultArray(rows) || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family member by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family member' });
  }
};

// Create a family member
export const createFamilyMember = async (req, res) => {
  try {
    const { name, relationship, is_default, family_id = 1 } = req.body;
    
    // Validate required fields
    if (!name || !relationship) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required fields' 
      });
      return;
    }
    
    // Check if family exists first
    const [familyCheck] = await pool.query('SELECT family_id FROM family WHERE family_id = ?', [family_id]);
    if (Array.isArray(familyCheck) && familyCheck.length === 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'The specified family does not exist' 
      });
      return;
    }
    
    // If this is set as default, unset any previous defaults
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = ?', [family_id]);
    }
    
    const query = `
      INSERT INTO family_members (family_id, name, relationship, is_default)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [family_id, name, relationship, is_default]);
    
    const id = result.insertId;
    
    res.status(201).json({ 
      status: 'success', 
      message: 'Family member added successfully',
      id
    });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add family member' });
  }
};

// Update a family member
export const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relationship, is_default, family_id } = req.body;
    
    // Validate required fields
    if (!name || !relationship) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required fields' 
      });
      return;
    }
    
    // Get current family ID for this member
    const [currentData] = await pool.query('SELECT family_id FROM family_members WHERE id = ?', [id]);
    if (Array.isArray(currentData) && currentData.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    const currentFamilyId = currentData[0].family_id;
    const targetFamilyId = family_id || currentFamilyId;
    
    // Check if target family exists if changing family
    if (family_id && family_id !== currentFamilyId) {
      const [familyCheck] = await pool.query('SELECT family_id FROM family WHERE family_id = ?', [family_id]);
      if (Array.isArray(familyCheck) && familyCheck.length === 0) {
        res.status(400).json({ 
          status: 'error', 
          message: 'The specified target family does not exist' 
        });
        return;
      }
    }
    
    // If this is set as default, unset any previous defaults in the family
    if (is_default) {
      await pool.query('UPDATE family_members SET is_default = 0 WHERE family_id = ?', [targetFamilyId]);
    }
    
    const query = `
      UPDATE family_members
      SET name = ?, relationship = ?, is_default = ?, family_id = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [name, relationship, is_default, targetFamilyId, id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member updated successfully' });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update family member' });
  }
};

// Delete a family member
export const deleteFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if this is a default member
    const [memberCheck] = await pool.query('SELECT is_default, family_id FROM family_members WHERE id = ?', [id]);
    
    if (!isResultArray(memberCheck) || memberCheck.length === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    if (memberCheck[0].is_default) {
      res.status(400).json({ status: 'error', message: 'Cannot delete the default family member' });
      return;
    }
    
    // Check if member has any transactions
    const [incomeCheck] = await pool.query('SELECT COUNT(*) as count FROM income WHERE family_member_id = ?', [id]);
    const [expenseCheck] = await pool.query('SELECT COUNT(*) as count FROM expenses WHERE family_member_id = ?', [id]);
    
    if ((incomeCheck[0].count > 0) || (expenseCheck[0].count > 0)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Cannot delete family member with existing transactions' 
      });
      return;
    }
    
    const query = 'DELETE FROM family_members WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'error', message: 'Family member not found' });
      return;
    }
    
    res.json({ status: 'success', message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete family member',
      error: error.message
    });
  }
};
