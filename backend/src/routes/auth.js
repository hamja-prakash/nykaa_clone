const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { generateToken } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { validateEmail, validatePassword, validatePhone } = require('../utils/validate');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const passwordErr = validatePassword(password);
    if (passwordErr) return res.status(400).json({ error: passwordErr });

    if (phone) {
      const phoneErr = validatePhone(phone);
      if (phoneErr) return res.status(400).json({ error: phoneErr });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
