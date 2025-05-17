
import express from 'express';
import * as familyController from '../controllers/familyController.js';

const router = express.Router();

// Family API endpoints
router.get('/', familyController.getAllFamilies);
router.get('/:id', familyController.getFamilyById);
router.post('/', familyController.createFamily);
router.put('/:id', familyController.updateFamily);
router.delete('/:id', familyController.deleteFamily);

export default router;
