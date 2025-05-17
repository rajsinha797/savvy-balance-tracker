
import pool from '../db/db.js';
import { isResultArray } from '../utils/queryHelpers.js';

/**
 * Get monthly report data
 */
export const getMonthlyReports = async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let incomeQuery = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(amount) as total
      FROM income
    `;
    
    let expenseQuery = `
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(amount) as total
      FROM expenses
    `;
    
    let incomeRows, expenseRows;
    
    if (familyId) {
      incomeQuery += ` WHERE family_member_id = ?
                      GROUP BY YEAR(date), MONTH(date)
                      ORDER BY YEAR(date) DESC, MONTH(date) DESC
                      LIMIT 12`;
      
      expenseQuery += ` WHERE family_member_id = ?
                      GROUP BY YEAR(date), MONTH(date)
                      ORDER BY YEAR(date) DESC, MONTH(date) DESC
                      LIMIT 12`;
      
      const [incomeResult] = await pool.query(incomeQuery, [familyId]);
      const [expenseResult] = await pool.query(expenseQuery, [familyId]);
      
      // Ensure we're working with arrays
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
    } else {
      incomeQuery += `
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      expenseQuery += `
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC
        LIMIT 12`;
      
      const [incomeResult] = await pool.query(incomeQuery);
      const [expenseResult] = await pool.query(expenseQuery);
      
      // Ensure we're working with arrays
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
    }
    
    res.json({ income: incomeRows, expenses: expenseRows });
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch monthly reports' });
  }
};

/**
 * Get weekly spending patterns
 */
export const getWeeklyReports = async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let query = `
      SELECT 
        DAYOFWEEK(date) as day_of_week,
        SUM(amount) as total
      FROM expenses
    `;
    
    let rows;
    
    if (familyId) {
      query += ` WHERE family_member_id = ?
                GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      
      const [result] = await pool.query(query, [familyId]);
      // Ensure we're working with an array
      rows = isResultArray(result) ? result : [];
    } else {
      query += ` GROUP BY DAYOFWEEK(date)
                ORDER BY DAYOFWEEK(date)`;
      
      const [result] = await pool.query(query);
      // Ensure we're working with an array
      rows = isResultArray(result) ? result : [];
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching weekly spending patterns:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch weekly spending patterns' });
  }
};

/**
 * Get yearly summary reports
 */
export const getYearlyReports = async (req, res) => {
  try {
    const familyId = req.query.family_member_id;
    
    let incomeQuery = `
      SELECT 
        YEAR(date) as year,
        SUM(amount) as total
      FROM income
    `;
    
    let expenseQuery = `
      SELECT 
        YEAR(date) as year,
        SUM(amount) as total
      FROM expenses
    `;
    
    let incomeRows, expenseRows;
    
    if (familyId) {
      incomeQuery += ` WHERE family_member_id = ?
                      GROUP BY YEAR(date)
                      ORDER BY YEAR(date) DESC
                      LIMIT 5`;
      
      expenseQuery += ` WHERE family_member_id = ?
                      GROUP BY YEAR(date)
                      ORDER BY YEAR(date) DESC
                      LIMIT 5`;
      
      const [incomeResult] = await pool.query(incomeQuery, [familyId]);
      const [expenseResult] = await pool.query(expenseQuery, [familyId]);
      
      // Ensure we're working with arrays
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
    } else {
      incomeQuery += `
        GROUP BY YEAR(date)
        ORDER BY YEAR(date) DESC
        LIMIT 5`;
      
      expenseQuery += `
        GROUP BY YEAR(date)
        ORDER BY YEAR(date) DESC
        LIMIT 5`;
      
      const [incomeResult] = await pool.query(incomeQuery);
      const [expenseResult] = await pool.query(expenseQuery);
      
      // Ensure we're working with arrays
      incomeRows = isResultArray(incomeResult) ? incomeResult : [];
      expenseRows = isResultArray(expenseResult) ? expenseResult : [];
    }
    
    // Calculate savings and growth rate
    const yearlyData = [];
    const years = new Set([
      ...incomeRows.map(row => row.year),
      ...expenseRows.map(row => row.year)
    ]);
    
    years.forEach(year => {
      const incomeEntry = incomeRows.find(row => row.year === year);
      const expenseEntry = expenseRows.find(row => row.year === year);
      
      const incomeTotal = incomeEntry ? Number(incomeEntry.total) : 0;
      const expenseTotal = expenseEntry ? Number(expenseEntry.total) : 0;
      const savings = incomeTotal - expenseTotal;
      
      yearlyData.push({
        year,
        income: incomeTotal,
        expenses: expenseTotal,
        savings,
        savingsRate: incomeTotal > 0 ? (savings / incomeTotal) * 100 : 0
      });
    });
    
    res.json({
      summary: yearlyData,
      income: incomeRows,
      expenses: expenseRows
    });
  } catch (error) {
    console.error('Error fetching yearly reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch yearly reports' });
  }
};
