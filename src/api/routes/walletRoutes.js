
import express from 'express';
import * as walletController from '../controllers/walletController.js';
import * as walletCategoryController from '../controllers/walletCategoryController.js';

const router = express.Router();

// Wallet API endpoints
router.get('/', walletController.getAllWallets);
router.get('/available', walletController.getAvailableWallets);
router.get('/:id', walletController.getWalletById);
router.post('/', walletController.createWallet);
router.put('/:id', walletController.updateWallet);
router.delete('/:id', walletController.deleteWallet);

// Wallet categorization endpoints
router.get('/types', walletCategoryController.getAllWalletTypes);
router.get('/categories/by-type/:typeId', walletCategoryController.getWalletCategoriesByType);
router.get('/subcategories/by-category/:categoryId', walletCategoryController.getWalletSubcategoriesByCategory);

// Wallet types/categories/subcategories management 
router.post('/types', walletCategoryController.createWalletType);
router.post('/categories', walletCategoryController.createWalletCategory);
router.post('/subcategories', walletCategoryController.createWalletSubcategory);

export default router;
