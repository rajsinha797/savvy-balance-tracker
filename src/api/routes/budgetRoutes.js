
import express from 'express';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

// Budget API endpoints
router.post('/sync-expenses', budgetController.syncExpensesWithBudget);
router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
router.post('/:budgetId/categories', budgetController.addBudgetCategory);
router.put('/:budgetId/categories/:categoryId', budgetController.updateBudgetCategory);
router.delete('/:budgetId/categories/:categoryId', budgetController.deleteBudgetCategory);

export default router;
