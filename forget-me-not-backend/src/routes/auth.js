const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
const router = express.Router();

// Simple login using stored password_hash (no hashing for demo purposes).
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'missing_credentials', message: 'Email and password required' });
  }
  if (!process.env.AUTH_JWT_SECRET) {
    return res.status(500).json({ error: 'missing_server_config', message: 'AUTH_JWT_SECRET not configured' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'invalid_login' });
  }

  if (user.password_hash !== password) {
    return res.status(401).json({ error: 'invalid_login' });
  }

  const token = jwt.sign({ sub: user.id }, process.env.AUTH_JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

module.exports = router;
