import express from 'express';
import multer from 'multer';

import RewardController from '../controllers/rewardController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
});

router
  .route('/')
  .get(protect, RewardController.getRewards)
  .post(protect, adminOnly, upload.single('image'), RewardController.createReward);

router.route('/:id').delete(protect, adminOnly, RewardController.deleteReward);

router.patch(
  '/:id/toggle',
  protect,
  adminOnly,
  RewardController.toggleRewardStatus,
);

router.get('/my-rewards', protect, RewardController.getMyRewards);
router.post('/claim', protect, RewardController.claimReward);
router.post('/verify', protect, RewardController.verifyAndUseCoupon);

export default router;
