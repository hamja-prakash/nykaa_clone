const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { brand: true, category: true } } },
    });
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1, shade, size } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, productId, quantity, shade, size },
      include: { product: true },
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PATCH /api/cart/:productId
router.patch('/:productId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = parseInt(req.params.productId);

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { userId_productId: { userId: req.user.id, productId } } });
      return res.json({ message: 'Item removed' });
    }

    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId: req.user.id, productId } },
      data: { quantity },
      include: { product: true },
    });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId: req.user.id, productId: parseInt(req.params.productId) } },
    });
    res.json({ message: 'Removed from cart' });
  } catch {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// DELETE /api/cart (clear all)
router.delete('/', authenticate, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
