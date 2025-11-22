const express = require('express');
const supabase = require('../db');
const router = express.Router();

// Update contact (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

// Delete contact
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ deleted: !!data.length, id });
});


// Get all contacts
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create contact
router.post('/', async (req, res) => {
  const contact = req.body;
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

// Get contacts for user
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;
