import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, category, unitPrice, mrp, gstRate, uom, currentStock, minStockAlert, location } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category || 'General',
        unitPrice: parseFloat(unitPrice),
        mrp: mrp ? parseFloat(mrp) : undefined,
        gstRate: gstRate ? parseFloat(gstRate) : 18,
        uom: uom || 'PCS',
        currentStock: parseInt(currentStock),
        minStockAlert: parseInt(minStockAlert),
        location: location || 'Rack A1',
      },
    });

    // Record initial stock log
    if (parseInt(currentStock) > 0) {
      await prisma.stockMovementLog.create({
        data: {
          productId: product.id,
          quantityChanged: parseInt(currentStock),
          movementType: 'IN',
          reason: 'Initial Stock Creation',
          createdBy: req.user!.id,
        },
      });
    }

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating product', error });
  }
};