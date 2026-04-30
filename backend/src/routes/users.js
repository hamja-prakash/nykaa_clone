const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/users/profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatar },
      select: { id: true, email: true, name: true, phone: true, avatar: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/users/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/users/addresses
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json(addresses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /api/users/addresses
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { type, name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.user.id, type, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
    });
    res.status(201).json(address);
  } catch {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    await prisma.address.deleteMany({ where: { id: parseInt(req.params.id), userId: req.user.id } });
    res.json({ message: 'Address deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;
