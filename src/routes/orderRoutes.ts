import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController';
import { identifyTenant } from '../middleware/tenant';

const router = Router();

// All order routes require tenant identification
router.use(identifyTenant);

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
