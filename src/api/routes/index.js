
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import incomeRoutes from './incomeRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import familyRoutes from './familyRoutes.js';
import familyMemberRoutes from './familyMemberRoutes.js';
import reportRoutes from './reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// API Documentation endpoint
router.get('/docs', (req, res) => {
  const docsPath = path.join(__dirname, '../api-docs.md');
  
  // Check if docs file exists
  if (fs.existsSync(docsPath)) {
    const docs = fs.readFileSync(docsPath, 'utf8');
    res.type('text/markdown').send(docs);
  } else {
    res.status(404).json({ status: 'error', message: 'Documentation not found' });
  }
});

// Test database connection
router.get('/test', async (req, res) => {
  try {
    const pool = (await import('../db/db.js')).default;
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'success', message: 'Database connected successfully', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to connect to the database' });
  }
});

// API routes
router.use('/income', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/families', familyRoutes);
router.use('/family/members', familyMemberRoutes);
router.use('/reports', reportRoutes);

// Home route
router.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Welcome to FinTrack API',
    endpoints: {
      docs: '/api/docs',
      test: '/api/test',
      income: '/api/income',
      incomeCategories: '/api/income/categories',
      expenses: '/api/expenses',
      families: '/api/families',
      familyMembers: '/api/family/members',
      reports: ['/api/reports/monthly', '/api/reports/weekly']
    }
  });
});

export default router;
