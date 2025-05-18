
import express from 'express';
import * as expenseController from '../controllers/expenseController.js';
import * as expenseCategoryController from '../controllers/expenseCategoryController.js';

const router = express.Router();

// Expense API endpoints
router.get('/', expenseController.getAllExpenses);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

// Expense category endpoints
router.get('/categories', expenseController.getExpenseCategories);

// Expense categorization endpoints
router.get('/types', expenseCategoryController.getAllExpenseTypes);
router.get('/categories/by-type/:typeId', expenseCategoryController.getExpenseCategoriesByType);
router.get('/subcategories/by-category/:categoryId', expenseCategoryController.getExpenseSubcategoriesByCategory);

export default router;
