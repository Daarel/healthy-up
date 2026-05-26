import express from 'express';

import { createProfile } from '../controllers/healthProfileController';

const router = express.Router();

router.post('/', createProfile);

export default router;
