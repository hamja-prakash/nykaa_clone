const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: { select: { name: true, images: true, slug: true } } } }, address: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { items: { include: { product: true } }, address: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders
router.post('/', authenticate, async (req, res) => {
  try {
    const { addressId, paymentMethod = 'COD', notes, couponCode, razorpayPaymentId } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryCharge = subtotal >= 499 ? 0 : 49;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
      });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'PERCENT'
          ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
          : coupon.value;
      }
    }

    const total = subtotal + deliveryCharge - discount;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        addressId: addressId || null,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : (razorpayPaymentId ? 'PAID' : 'PENDING'),
        notes: notes || (razorpayPaymentId ? `Razorpay Payment ID: ${razorpayPaymentId}` : undefined),
        subtotal,
        deliveryCharge,
        discount,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            shade: item.shade,
            size: item.size,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart after order placed
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
