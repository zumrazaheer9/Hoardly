import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getProducts,
  getProductBySlug,
  getProductReviews,
  getReviewEligibility,
  createReview,
} from '../controllers/products.js';

const router = Router();

// Public catalog routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/:id/review-eligibility', requireAuth, getReviewEligibility);
router.get('/:id/reviews', getProductReviews);

// Authenticated review submission
router.post('/:id/reviews', requireAuth, createReview);

export default router;
