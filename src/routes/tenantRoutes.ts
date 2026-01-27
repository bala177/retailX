import { Router } from 'express';
import {
  createTenant,
  getAllTenants,
  getTenant,
  updateTenant,
  deleteTenant,
} from '../controllers/tenantController';
import { apiLimiter, tenantCreationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

router.post('/', tenantCreationLimiter, createTenant);
router.get('/', getAllTenants);
router.get('/:id', getTenant);
router.put('/:id', updateTenant);
router.delete('/:id', deleteTenant);

export default router;
