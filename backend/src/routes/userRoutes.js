import express from 'express';

import { deleteProfile, getUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.route('/user').get(getUserProfile).delete(deleteProfile);

export default router;
