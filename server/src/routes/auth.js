import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.js';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// Authenticated routes
router.post('/logout', requireAuth, logout);
router.post('/reset-password', requireAuth, validate(resetPasswordSchema), resetPassword);
router.get('/me', requireAuth, getMe);

export default router;
