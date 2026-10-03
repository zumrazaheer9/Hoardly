import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createOrder, getOrder, getOrders } from '../controllers/orders.js';
const router = Router();
router.use(requireAuth);
router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
export default router;
