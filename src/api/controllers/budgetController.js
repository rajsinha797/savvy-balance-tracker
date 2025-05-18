import pool from '../db/db.js';
import { isResultArray, getUuidFromResult } from '../utils/queryHelpers.js';

// Sync expenses with budget
export const syncExpensesWithBudget = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({
        status: 'error',
        message: 'Year and month are required'
      });
    }

    // Find the budget for this period
    const [budgets] = await pool.query(
      'SELECT id FROM budgets WHERE year = ? AND month = ?', 
      [year, month]
    );

    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No budget found for this period'
      });
    }

    const budgetId = budgets[0].id;

    // Get all expense categories in this period
    const [expenses] = await pool.query(
      `SELECT category, type, sub_category, SUM(amount) as total
       FROM expenses 
       WHERE YEAR(date) = ? AND MONTH(date) = ?
       GROUP BY category, type, sub_category`, 
      [year, month]
    );

    if (!isResultArray(expenses)) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch expenses'
      });
    }

    // Update budget category spent amounts
    for (const expense of expenses) {
      // Find matching budget category
      const [categories] = await pool.query(
        `SELECT id, allocated, spent FROM budget_categories 
         WHERE budget_id = ? AND category = ? AND 
         (type IS NULL OR type = ?) AND
         (sub_category IS NULL OR sub_category = ?)`,
        [budgetId, expense.category, expense.type || null, expense.sub_category || null]
      );

      if (isResultArray(categories) && categories.length > 0) {
        const category = categories[0];
        
        // Update the spent amount
        await pool.query(
          'UPDATE budget_categories SET spent = ? WHERE id = ?',
          [expense.total, category.id]
        );
        
        // Calculate spending difference to update budget total
        const spentDiff = expense.total - category.spent;
        
        if (spentDiff !== 0) {
          await pool.query(
            'UPDATE budgets SET total_spent = total_spent + ? WHERE id = ?',
            [spentDiff, budgetId]
          );
        }
      }
    }

    res.json({
      status: 'success',
      success: true,
      message: 'Budget synchronized with expenses successfully'
    });
  } catch (error) {
    console.error('Error syncing expenses with budget:', error);
    res.status(500).json({
      status: 'error',
      success: false,
      message: 'Failed to sync expenses with budget',
      error: error.message
    });
  }
};

// Get all budget periods
export const getAllBudgets = async (req, res) => {
  try {
    // Check if the budgets table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_NAME = 'budgets' AND TABLE_SCHEMA = database()
    `);

    // If the table doesn't exist, create it
    if (!isResultArray(tables) || tables.length === 0) {
      await pool.query(`
        CREATE TABLE budgets (
          id VARCHAR(36) PRIMARY KEY,
          month INT NOT NULL,
          year INT NOT NULL,
          total_allocated DECIMAL(10,2) DEFAULT 0.00,
          total_spent DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE budget_categories (
          id VARCHAR(36) PRIMARY KEY,
          budget_id VARCHAR(36) NOT NULL,
          category VARCHAR(50) NOT NULL,
          allocated DECIMAL(10,2) DEFAULT 0.00,
          spent DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
        )
      `);
      
      // Return empty array since no budgets exist yet
      return res.json([]);
    }

    // Check if budget_categories table has type and sub_category columns
    const [categoryColumns] = await pool.query(`
      SHOW COLUMNS FROM budget_categories 
      WHERE Field IN ('type', 'sub_category')
    `);

    // Add missing columns if needed
    if (!isResultArray(categoryColumns) || categoryColumns.length < 2) {
      try {
        if (!categoryColumns.some(col => col.Field === 'type')) {
          await pool.query(`
            ALTER TABLE budget_categories 
            ADD COLUMN type VARCHAR(50) AFTER category
          `);
        }
        
        if (!categoryColumns.some(col => col.Field === 'sub_category')) {
          await pool.query(`
            ALTER TABLE budget_categories 
            ADD COLUMN sub_category VARCHAR(50) AFTER type
          `);
        }
      } catch (alterError) {
        console.error('Error altering budget_categories table:', alterError);
        // Continue execution even if alter fails
      }
    }

    // Query the budgets with their categories
    const [budgets] = await pool.query(`
      SELECT 
        b.id, b.month, b.year, b.total_allocated, b.total_spent
      FROM 
        budgets b
      ORDER BY 
        b.year DESC, b.month DESC
    `);

    // For each budget, get the categories
    const result = [];
    
    if (isResultArray(budgets)) {
      for (const budget of budgets) {
        // Check columns again to determine the right query
        const [checkColumns] = await pool.query(`
          SHOW COLUMNS FROM budget_categories 
          WHERE Field IN ('type', 'sub_category')
        `);
        
        let categories;
        
        if (isResultArray(checkColumns) && checkColumns.length === 2) {
          // Both columns exist, use them
          const [categoriesResult] = await pool.query(`
            SELECT 
              id, category, type, sub_category, allocated, spent
            FROM 
              budget_categories
            WHERE 
              budget_id = ?
          `, [budget.id]);
          
          categories = categoriesResult;
        } else {
          // Columns don't exist, query without them
          const [categoriesResult] = await pool.query(`
            SELECT 
              id, category, allocated, spent
            FROM 
              budget_categories
            WHERE 
              budget_id = ?
          `, [budget.id]);
          
          // Add null values for missing columns
          categories = categoriesResult.map(cat => ({
            ...cat,
            type: null,
            sub_category: null
          }));
        }
  
        // Calculate remaining and percentage for each category
        const formattedCategories = isResultArray(categories) ? categories.map(category => {
          const remaining = category.allocated - category.spent;
          const percentageUsed = category.allocated > 0 
            ? Math.round((category.spent / category.allocated) * 100) 
            : 0;
            
          return {
            id: category.id,
            category: category.category,
            type: category.type || null,
            subCategory: category.sub_category || null,
            allocated: parseFloat(category.allocated),
            spent: parseFloat(category.spent),
            remaining,
            percentageUsed
          };
        }) : [];
  
        result.push({
          id: budget.id,
          month: budget.month,
          year: budget.year,
          totalAllocated: parseFloat(budget.total_allocated),
          totalSpent: parseFloat(budget.total_spent),
          categories: formattedCategories
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    // Return empty array on error
    res.json([]);
  }
};

// Get budget period by ID
export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the budget
    const [budgets] = await pool.query(`
      SELECT 
        id, month, year, total_allocated, total_spent
      FROM 
        budgets
      WHERE 
        id = ?
    `, [id]);

    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    const budget = budgets[0];

    // Get the categories for this budget
    const [categories] = await pool.query(`
      SELECT 
        id, category, type, sub_category, allocated, spent
      FROM 
        budget_categories
      WHERE 
        budget_id = ?
    `, [id]);

    // Calculate remaining and percentage for each category
    const formattedCategories = isResultArray(categories) ? categories.map(category => {
      const remaining = category.allocated - category.spent;
      const percentageUsed = category.allocated > 0 
        ? Math.round((category.spent / category.allocated) * 100) 
        : 0;
        
      return {
        id: category.id,
        category: category.category,
        type: category.type,
        subCategory: category.sub_category,
        allocated: parseFloat(category.allocated),
        spent: parseFloat(category.spent),
        remaining,
        percentageUsed
      };
    }) : [];

    res.json({
      id: budget.id,
      month: budget.month,
      year: budget.year,
      totalAllocated: parseFloat(budget.total_allocated),
      totalSpent: parseFloat(budget.total_spent),
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch budget period',
      error: error.message
    });
  }
};

// Create budget period
export const createBudget = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Month and year are required fields' 
      });
    }

    // Generate UUID for the budget
    const [uuidResult] = await pool.query('SELECT UUID() as id');
    
    // Use the enhanced helper function to safely get UUID
    const id = getUuidFromResult(uuidResult);
    if (!id) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate UUID'
      });
    }

    // Insert the new budget
    await pool.query(`
      INSERT INTO budgets (id, month, year, total_allocated, total_spent)
      VALUES (?, ?, ?, 0, 0)
    `, [id, month, year]);

    // Return the newly created budget
    res.status(201).json({
      id,
      month,
      year,
      totalAllocated: 0,
      totalSpent: 0,
      categories: []
    });
  } catch (error) {
    console.error('Error creating budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create budget period',
      error: error.message
    });
  }
};

// Update budget period
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, totalAllocated, totalSpent } = req.body;

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT id FROM budgets WHERE id = ?', [id]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Build the dynamic SQL query based on provided fields
    let updateFields = [];
    let updateValues = [];

    if (month !== undefined) {
      updateFields.push('month = ?');
      updateValues.push(month);
    }
    if (year !== undefined) {
      updateFields.push('year = ?');
      updateValues.push(year);
    }
    if (totalAllocated !== undefined) {
      updateFields.push('total_allocated = ?');
      updateValues.push(totalAllocated);
    }
    if (totalSpent !== undefined) {
      updateFields.push('total_spent = ?');
      updateValues.push(totalSpent);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No fields provided for update' 
      });
    }

    // Add id to the values array
    updateValues.push(id);

    // Execute the update
    await pool.query(`
      UPDATE budgets
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Get the updated budget
    const [budgets] = await pool.query('SELECT * FROM budgets WHERE id = ?', [id]);
    
    // Check if budgets is an array and not empty
    if (!isResultArray(budgets) || budgets.length === 0) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch updated budget data' 
      });
    }
    
    const [categories] = await pool.query('SELECT * FROM budget_categories WHERE budget_id = ?', [id]);

    // Calculate remaining and percentage for each category
    const formattedCategories = isResultArray(categories) ? categories.map(category => {
      const remaining = category.allocated - category.spent;
      const percentageUsed = category.allocated > 0 
        ? Math.round((category.spent / category.allocated) * 100) 
        : 0;
        
      return {
        id: category.id,
        category: category.category,
        type: category.type,
        subCategory: category.sub_category,
        allocated: parseFloat(category.allocated),
        spent: parseFloat(category.spent),
        remaining,
        percentageUsed
      };
    }) : [];

    const budget = budgets[0];
    res.json({
      id: budget.id,
      month: budget.month,
      year: budget.year,
      totalAllocated: parseFloat(budget.total_allocated),
      totalSpent: parseFloat(budget.total_spent),
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Error updating budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update budget period',
      error: error.message
    });
  }
};

// Delete budget period
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT id FROM budgets WHERE id = ?', [id]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Delete the budget (cascade will delete associated categories)
    await pool.query('DELETE FROM budgets WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Budget period deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget period:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete budget period',
      error: error.message
    });
  }
};

// Add category to budget
export const addBudgetCategory = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { category, type, subCategory, allocated } = req.body;
    
    // Validate required fields
    if (!category || allocated === undefined) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Category name and allocated amount are required' 
      });
    }

    // Check if the budget exists
    const [budgetCheck] = await pool.query('SELECT * FROM budgets WHERE id = ?', [budgetId]);
    if (!isResultArray(budgetCheck) || budgetCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget period not found' 
      });
    }

    // Check if this category already exists in this budget with the same type and subcategory
    const [categoryCheck] = await pool.query(
      'SELECT id FROM budget_categories WHERE budget_id = ? AND category = ? AND type <=> ? AND sub_category <=> ?', 
      [budgetId, category, type || null, subCategory || null]
    );
    
    if (isResultArray(categoryCheck) && categoryCheck.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'This category combination already exists in this budget' 
      });
    }

    // Generate UUID for the category
    const [uuidResult] = await pool.query('SELECT UUID() as id');
    
    // Use the enhanced helper function to safely get UUID
    const id = getUuidFromResult(uuidResult);
    if (!id) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate UUID'
      });
    }

    // Insert the new category
    await pool.query(`
      INSERT INTO budget_categories (id, budget_id, category, type, sub_category, allocated, spent)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [id, budgetId, category, type || null, subCategory || null, allocated]);

    // Update the total_allocated in the budget
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated + ? 
      WHERE id = ?
    `, [allocated, budgetId]);

    // Return the newly created category
    const remaining = allocated;
    const percentageUsed = 0;
    
    res.status(201).json({
      id,
      category,
      type,
      subCategory,
      allocated: parseFloat(allocated),
      spent: 0,
      remaining,
      percentageUsed
    });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to add budget category',
      error: error.message
    });
  }
};

// Update category in budget
export const updateBudgetCategory = async (req, res) => {
  try {
    const { budgetId, categoryId } = req.params;
    const { allocated, spent, type, subCategory } = req.body;

    // Check if the budget and category exist
    const [categoryCheck] = await pool.query(
      'SELECT * FROM budget_categories WHERE id = ? AND budget_id = ?', 
      [categoryId, budgetId]
    );
    
    if (!isResultArray(categoryCheck) || categoryCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget category not found' 
      });
    }

    const oldCategory = categoryCheck[0];
    const newAllocated = allocated !== undefined ? allocated : oldCategory.allocated;
    const newSpent = spent !== undefined ? spent : oldCategory.spent;
    const newType = type !== undefined ? type : oldCategory.type;
    const newSubCategory = subCategory !== undefined ? subCategory : oldCategory.sub_category;

    // Calculate the difference to update budget totals
    const allocatedDiff = newAllocated - oldCategory.allocated;
    const spentDiff = newSpent - oldCategory.spent;

    // Update the category
    await pool.query(`
      UPDATE budget_categories
      SET allocated = ?, spent = ?, type = ?, sub_category = ?
      WHERE id = ?
    `, [newAllocated, newSpent, newType, newSubCategory, categoryId]);

    // Update the budget totals
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated + ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `, [allocatedDiff, spentDiff, budgetId]);

    // Calculate the updated values
    const remaining = newAllocated - newSpent;
    const percentageUsed = newAllocated > 0 
      ? Math.round((newSpent / newAllocated) * 100) 
      : 0;

    // Return the updated category
    res.json({
      id: categoryId,
      category: oldCategory.category,
      type: newType,
      subCategory: newSubCategory,
      allocated: parseFloat(newAllocated),
      spent: parseFloat(newSpent),
      remaining,
      percentageUsed
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update budget category',
      error: error.message
    });
  }
};

// Delete category from budget
export const deleteBudgetCategory = async (req, res) => {
  try {
    const { budgetId, categoryId } = req.params;

    // Check if the category exists
    const [categoryCheck] = await pool.query(
      'SELECT * FROM budget_categories WHERE id = ? AND budget_id = ?', 
      [categoryId, budgetId]
    );
    
    if (!isResultArray(categoryCheck) || categoryCheck.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Budget category not found' 
      });
    }

    const category = categoryCheck[0];

    // Update the budget totals before deleting the category
    await pool.query(`
      UPDATE budgets 
      SET total_allocated = total_allocated - ?,
          total_spent = total_spent - ?
      WHERE id = ?
    `, [category.allocated, category.spent, budgetId]);

    // Delete the category
    await pool.query('DELETE FROM budget_categories WHERE id = ?', [categoryId]);

    res.json({
      status: 'success',
      message: 'Budget category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete budget category',
      error: error.message
    });
  }
};
