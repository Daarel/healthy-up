import express from 'express';

import { createProfile } from '../controllers/healthProfilesController';

const router = express.Router();

router.post('/', createProfile);

export default router;
