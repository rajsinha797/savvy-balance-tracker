
import pool from '../db/db.js';
import { isResultArray } from '../utils/queryHelpers.js';

// Get reports data (monthly summaries)
export const getMonthlyReports = async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(amount) as total
      FROM income
    `;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                LIMIT 12`;
      const [incomeRows] = await pool.query(query, [familyId]);
      
      query = `
        SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          SUM(amount) as total
        FROM expenses
        WHERE family_member_id = ?
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [expenseRows] = await pool.query(query, [familyId]);
      
      // Check if the results are arrays before sending them
      const incomes = isResultArray(incomeRows) ? incomeRows : [];
      const expenses = isResultArray(expenseRows) ? expenseRows : [];
      
      res.json({ income: incomes, expenses: expenses });
    } else {
      query += `
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [incomeRows] = await pool.query(query);
      
      query = `
        SELECT 
          YEAR(date) as year,
          MONTH(date) as month,
          SUM(amount) as total
        FROM expenses
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [expenseRows] = await pool.query(query);
      
      // Check if the results are arrays before sending them
      const incomes = isResultArray(incomeRows) ? incomeRows : [];
      const expenses = isResultArray(expenseRows) ? expenseRows : [];
      
      res.json({ income: incomes, expenses: expenses });
    }
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monthly reports' });
  }
};

// Get weekly spending patterns
export const getWeeklyReports = async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        DAYOFWEEK(date) as day_of_week,
        SUM(amount) as total
      FROM expenses
    `;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query, [familyId]);
      
      // Check if the result is an array before sending it
      const result = isResultArray(rows) ? rows : [];
      
      res.json(result);
    } else {
      query += ` GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      const [rows] = await pool.query(query);
      
      // Check if the result is an array before sending it
      const result = isResultArray(rows) ? rows : [];
      
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching weekly spending patterns:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch weekly spending patterns' });
  }
};
