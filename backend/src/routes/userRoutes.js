import express from 'express';
import multer from 'multer';

import UserController from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
});

router.get('/all-users', protect, adminOnly, UserController.getAllUsers);

router.delete('/:id', protect, adminOnly, UserController.deleteUserByAdmin);

router.use('/user', protect);

router
  .route('/user')
  .get(UserController.getUserProfile)
  .delete(UserController.deleteProfile);

router.patch(
  '/profile/picture',
  protect,
  upload.single('profilePicture'),
  UserController.updatePicture,
);
router.post('/user/level-up', protect, UserController.levelUp);

export default router;
