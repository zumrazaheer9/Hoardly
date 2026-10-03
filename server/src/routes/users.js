import { Router } from 'express';
import { getProfile, updatePassword, updateProfile } from '../controllers/users.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updatePasswordSchema, updateProfileSchema } from '../validators/users.js';

const router = Router();
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile);
router.put('/password', requireAuth, validate(updatePasswordSchema), updatePassword);

export default router;