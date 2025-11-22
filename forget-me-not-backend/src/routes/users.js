const express = require('express');
const supabase = require('../db');
const router = express.Router();

// Update user (PATCH)
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ deleted: !!data.length, id });
});


// Get all users
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

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

// Get user by id
router.get('/:id', async (req, res) => {
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
