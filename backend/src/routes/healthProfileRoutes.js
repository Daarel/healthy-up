import express from 'express';

import { createProfile } from '../controllers/healthProfileController';
import { getCaloriesSummary } from '../controllers/healthProfileController';


const router = express.Router();

router.post('/', createProfile);
router.get('/caloriesSummary', getCaloriesSummary);

export default router;
