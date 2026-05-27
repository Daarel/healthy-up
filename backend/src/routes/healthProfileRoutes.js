import express from 'express';

import { createProfile } from '../controllers/healthProfileController';
import { getCaloriesSummary } from '../controllers/healthProfileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createProfile);
router.get('/caloriesSummary', protect, getCaloriesSummary);

export default router;
