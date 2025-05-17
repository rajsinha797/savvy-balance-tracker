
import express from 'express';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// Report API endpoints
router.get('/monthly', reportController.getMonthlyReports);
router.get('/weekly', reportController.getWeeklyReports);
router.get('/yearly', reportController.getYearlyReports);

export default router;
