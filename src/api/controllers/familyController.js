
import pool from '../db/db.js';
import { isResultArray, getSafeRows } from '../utils/queryHelpers.js';

/**
 * Get all families
 */
export const getAllFamilies = async (req, res) => {
  try {
    // Using a simple query since there's only one family in our schema
    const [result] = await pool.query(`
      SELECT family_id, name
      FROM family
    `);
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    if (rows.length === 0) {
      // If no families exist in DB, return a default family
      return res.json([{
        family_id: 1,
        name: 'Default Family'
      }]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch families',
      error: error.message 
    });
  }
};

/**
 * Get family by ID
 */
export const getFamilyById = async (req, res) => {
  try {
    const familyId = req.params.id;
    
    const [result] = await pool.query(`
      SELECT family_id, name
      FROM family
      WHERE family_id = ?
    `, [familyId]);
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Family not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family' });
  }
};

/**
 * Create a new family
 */
export const createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Family name is required' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO family (name)
      VALUES (?)
    `, [name]);
    
    res.status(201).json({
      status: 'success',
      message: 'Family created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create family' });
  }
};

/**
 * Update family
 */
export const updateFamily = async (req, res) => {
  try {
    const familyId = req.params.id;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Family name is required' });
    }
    
    const [result] = await pool.query(`
      UPDATE family
      SET name = ?
      WHERE family_id = ?
    `, [name, familyId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Family not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Family updated successfully'
    });
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update family' });
  }
};

/**
 * Delete family
 */
export const deleteFamily = async (req, res) => {
  try {
    const familyId = req.params.id;
    
    const [result] = await pool.query(`
      DELETE FROM family
      WHERE family_id = ?
    `, [familyId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Family not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Family deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete family' });
  }
};

/**
 * Get all family members
 */
export const getAllFamilyMembers = async (req, res) => {
  try {
    const familyId = req.query.family_id;
    
    let query = `
      SELECT id, name, relation as relationship, 
      CASE WHEN relation = 'Self' THEN true ELSE false END as is_default
      FROM family_members
    `;
    
    let params = [];
    
    if (familyId) {
      // Note: Our schema doesn't have family_id in family_members table
      // But we'll return all members since this is a demo app
      // In a real app, you'd filter by family_id
    }
    
    const [result] = await pool.query(query, params);
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch family members',
      error: error.message 
    });
  }
};

/**
 * Get family member by ID
 */
export const getFamilyMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    const [result] = await pool.query(`
      SELECT id, name, relation as relationship,
      CASE WHEN relation = 'Self' THEN true ELSE false END as is_default
      FROM family_members
      WHERE id = ?
    `, [memberId]);
    
    // Ensure we're working with an array
    const rows = isResultArray(result) ? result : [];
    
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Family member not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching family member by ID:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch family member' });
  }
};

/**
 * Create a new family member
 */
export const createFamilyMember = async (req, res) => {
  try {
    const { name, relationship } = req.body;
    
    if (!name || !relationship) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required' 
      });
    }
    
    const [result] = await pool.query(`
      INSERT INTO family_members (id, name, relation)
      VALUES (UUID(), ?, ?)
    `, [name, relationship]);
    
    // Get the newly created member's ID
    const [idResult] = await pool.query(`
      SELECT id FROM family_members
      WHERE name = ? AND relation = ?
      ORDER BY created_at DESC LIMIT 1
    `, [name, relationship]);
    
    const memberId = idResult[0]?.id || null;
    
    res.status(201).json({
      status: 'success',
      message: 'Family member created successfully',
      id: memberId
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create family member',
      error: error.message
    });
  }
};

/**
 * Update family member
 */
export const updateFamilyMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, relationship } = req.body;
    
    if (!name || !relationship) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name and relationship are required' 
      });
    }
    
    const [result] = await pool.query(`
      UPDATE family_members
      SET name = ?, relation = ?
      WHERE id = ?
    `, [name, relationship, memberId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Family member not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Family member updated successfully'
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update family member' });
  }
};

/**
 * Delete family member
 */
export const deleteFamilyMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    const [result] = await pool.query(`
      DELETE FROM family_members
      WHERE id = ?
    `, [memberId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Family member not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Family member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete family member' });
  }
};
