
import express from 'express';
import * as incomeController from '../controllers/incomeController.js';

const router = express.Router();

// Income API endpoints
router.get('/categories', incomeController.getAllIncomeCategories);
router.get('/types', incomeController.getAllIncomeTypes);
router.get('/categories/by-type/:typeId', incomeController.getCategoriesByType);
router.get('/subcategories/by-category/:categoryId', incomeController.getSubcategoriesByCategory);
router.get('/', incomeController.getAllIncomes);
router.get('/:id', incomeController.getIncomeById);
router.post('/', incomeController.createIncome);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

export default router;
