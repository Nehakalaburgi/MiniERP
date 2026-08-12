import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Get all customers (with search & status filter)
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, type } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (type) where.type = String(type);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { businessName: { contains: String(search) } },
        { mobile: { contains: String(search) } },
        { email: { contains: String(search) } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching customers', error });
  }
};

// 2. Get single customer details
export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        },
        salesChallans: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching customer details', error });
  }
};

// 3. Create new customer
export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, mobile, email, businessName, gstNumber, type, address, status, followUpDate, notes } = req.body;

    if (!name || !mobile || !email || !businessName || !address) {
      return res.status(400).json({ message: 'Missing required customer fields' });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        type: type || 'RETAIL',
        address,
        status: status || 'LEAD',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes,
      },
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating customer', error });
  }
};

// 4. Add follow-up note
export const addFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) return res.status(400).json({ message: 'Note content is required' });

    const followUp = await prisma.followUpNote.create({
      data: {
        customerId: id,
        note,
        createdBy: req.user!.id,
      },
    });

    return res.status(201).json(followUp);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding follow-up note', error });
  }
};