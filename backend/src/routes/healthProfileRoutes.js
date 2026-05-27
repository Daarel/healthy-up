import express from 'express';

import {
  createProfile,
  createWeightLog,
  getCaloriesSummary,
  getWeightLog,
} from '../controllers/healthProfileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createProfile);
router.get('/caloriesSummary', protect, getCaloriesSummary);

router.use('/weight-logs', protect);
router.route('/weight-logs').get(getWeightLog).post(createWeightLog);

export default router;
