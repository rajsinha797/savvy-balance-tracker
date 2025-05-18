
import express from 'express';
import incomeRoutes from './incomeRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import familyRoutes from './familyRoutes.js';
import familyMemberRoutes from './familyMemberRoutes.js';
import reportRoutes from './reportRoutes.js';
import walletRoutes from './walletRoutes.js';

const router = express.Router();

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    message: 'FinTrack API Documentation',
    endpoints: [
      { path: '/api/income', description: 'Income related endpoints' },
      { path: '/api/expenses', description: 'Expense related endpoints' },
      { path: '/api/budgets', description: 'Budget related endpoints' },
      { path: '/api/families', description: 'Family related endpoints' },
      { path: '/api/family-members', description: 'Family members related endpoints' },
      { path: '/api/reports', description: 'Reports related endpoints' },
      { path: '/api/wallet', description: 'Wallet related endpoints' }
    ]
  });
});

// Mount routes
router.use('/income', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/families', familyRoutes);
router.use('/family-members', familyMemberRoutes);
router.use('/reports', reportRoutes);
router.use('/wallet', walletRoutes);

export default router;
