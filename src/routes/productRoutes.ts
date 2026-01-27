import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from '../controllers/productController';
import { identifyTenant } from '../middleware/tenant';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// All product routes require tenant identification
router.use(identifyTenant);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/categories', getProductsByCategory);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
