import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, items, status } = req.body; // items: [{ productId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Challan must contain at least one product item' });
    }

    const challanStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'DRAFT';
    const challanNumber = `CH-${Date.now().toString().slice(-6)}`;
    let totalQuantity = 0;

    // Check stock if attempting to confirm immediately
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      if (challanStatus === 'CONFIRMED' && product.currentStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product "${product.name}". Available: ${product.currentStock}, Required: ${item.quantity}` 
        });
      }
      totalQuantity += item.quantity;
    }

    // Process Challan Creation inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status: challanStatus,
          createdBy: req.user!.id,
        },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        await tx.salesChallanItem.create({
          data: {
            challanId: challan.id,
            productId: item.productId,
            productNameSnapshot: product!.name,
            unitPriceSnapshot: product!.unitPrice,
            skuSnapshot: product!.sku,
            quantity: item.quantity,
          },
        });

        // Deduct stock and log movement if CONFIRMED
        if (challanStatus === 'CONFIRMED') {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovementLog.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan #${challanNumber}`,
              createdBy: req.user!.id,
            },
          });
        }
      }

      return challan;
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating sales challan', error });
  }
};
// Fetch all sales challans with customer details
export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const challans = await prisma.salesChallan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, businessName: true },
        },
        items: true,
      },
    });
    return res.json(challans);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching sales challans history', error });
  }
};