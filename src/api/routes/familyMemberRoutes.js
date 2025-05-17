
import express from 'express';
import * as familyController from '../controllers/familyController.js';

const router = express.Router();

// Family member API endpoints
router.get('/', familyController.getAllFamilyMembers);
router.get('/:id', familyController.getFamilyMemberById);
router.post('/', familyController.createFamilyMember);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.deleteFamilyMember);

export default router;
