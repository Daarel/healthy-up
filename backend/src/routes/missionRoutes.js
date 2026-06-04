import express from 'express';
import multer from 'multer';

import MissionController from '../controllers/missionController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/generate', protect, MissionController.generateMissions);
router.get('/progress/weekly', protect, MissionController.getWeeklyProgress);

// Admin-only: must be registered before /:id to prevent Express matching 'admin' as an id
router.get(
  '/admin/pending',
  protect,
  adminOnly,
  MissionController.getPendingVerifications,
);

router.get('/:id', protect, MissionController.getMissionById);
router.patch(
  '/:id/status',
  protect,
  upload.single('proofImage'),
  MissionController.updateMissionStatus,
);

router.patch(
  '/:id/verify',
  protect,
  adminOnly,
  MissionController.verifyMission,
);

router.get('/', protect, MissionController.getUserMissions);

export default router;
