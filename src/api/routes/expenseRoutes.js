
import express from 'express';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

// Expense API endpoints
router.get('/', expenseController.getAllExpenses);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.get('/categories', expenseController.getExpenseCategories);

export default router;
