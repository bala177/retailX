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

const router = Router();

// All product routes require tenant identification
router.use(identifyTenant);

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/categories', getProductsByCategory);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
