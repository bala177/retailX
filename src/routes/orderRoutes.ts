import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController';
import { identifyTenant } from '../middleware/tenant';
import { apiLimiter, orderCreationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// All order routes require tenant identification
router.use(identifyTenant);

router.post('/', orderCreationLimiter, createOrder);
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
