import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), createProduct);

export default router;