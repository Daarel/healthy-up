import express from 'express';

import {
  deleteProfile,
  getUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.use('/user', protect)
router.route('/user').get(getUserProfile).delete(deleteProfile);

export default router;
