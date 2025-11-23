const express = require('express');
const supabase = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

function ensureSelf(req, res, next) {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'forbidden', message: 'Cannot access other users' });
  }
  return next();
}

// Create user
router.post('/', async (req, res) => {
  const { name, email, password_hash } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash }])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

router.use(requireAuth);

// Get current user
router.get('/me', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

// Get all users (scoped to self to avoid leaks)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Update user (PATCH)
router.patch('/:id', ensureSelf, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

// Delete user
router.delete('/:id', ensureSelf, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ deleted: !!data.length, id });
});

// Get user by id (self only)
router.get('/:id', ensureSelf, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

module.exports = router;
