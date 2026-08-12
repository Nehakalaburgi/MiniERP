import { Router } from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  addFollowUpNote 
} from '../controllers/customer.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes with JWT authentication
router.use(authenticateToken);

// GET /api/customers - List & Search customers (Admin, Sales, Accounts)
router.get('/', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), getCustomers);

// GET /api/customers/:id - View single customer details with follow-ups & challans
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), getCustomerById);

// POST /api/customers - Add new customer (Admin, Sales)
router.post('/', authorizeRoles('ADMIN', 'SALES'), createCustomer);

// POST /api/customers/:id/notes - Add follow-up note to customer (Admin, Sales)
router.post('/:id/notes', authorizeRoles('ADMIN', 'SALES'), addFollowUpNote);

export default router;