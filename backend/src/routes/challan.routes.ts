import { Router } from 'express';
import { createChallan, getChallans } from '../controllers/challan.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// GET /api/challans - List all sales history
router.get('/', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), getChallans);

// POST /api/challans - Create new delivery challan
router.post('/', authorizeRoles('ADMIN', 'SALES'), createChallan);

export default router;