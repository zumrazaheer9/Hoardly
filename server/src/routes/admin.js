import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  createDiscountSchema,
  createProductSchema,
  orderStatusSchema,
  updateCategorySchema,
  updateDiscountSchema,
  updateProductSchema,
} from '../validators/admin.js';
import {
  createAdminCategory,
  createAdminDiscount,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminDiscount,
  deleteAdminProduct,
  getAdminCategories,
  getAdminDiscounts,
  getAdminOrders,
  getAdminProducts,
  getAdminStats,
  updateAdminCategory,
  updateAdminDiscount,
  updateAdminOrderStatus,
  updateAdminProduct,
} from '../controllers/admin.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/stats', getAdminStats);
router.route('/products')
  .get(getAdminProducts)
  .post(validate(createProductSchema), createAdminProduct);
router.route('/products/:id')
  .put(validate(updateProductSchema), updateAdminProduct)
  .delete(deleteAdminProduct);
router.route('/categories')
  .get(getAdminCategories)
  .post(validate(createCategorySchema), createAdminCategory);
router.route('/categories/:id')
  .put(validate(updateCategorySchema), updateAdminCategory)
  .delete(deleteAdminCategory);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', validate(orderStatusSchema), updateAdminOrderStatus);
router.route('/discounts')
  .get(getAdminDiscounts)
  .post(validate(createDiscountSchema), createAdminDiscount);
router.route('/discounts/:id')
  .put(validate(updateDiscountSchema), updateAdminDiscount)
  .delete(deleteAdminDiscount);

export default router;