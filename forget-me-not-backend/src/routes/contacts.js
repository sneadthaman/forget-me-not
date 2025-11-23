const express = require('express');
const supabase = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

// Update contact (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select();
  if (error) return res.status(400).json({ error });
  if (!data || !data.length) return res.status(404).json({ error: 'contact_not_found' });
  res.json(data[0]);
});

// Delete contact
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ deleted: !!data.length, id });
});


// Get all contacts
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', req.user.id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create contact
router.post('/', async (req, res) => {
  const contact = { ...req.body, user_id: req.user.id };
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
  if (user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden', message: 'Cannot access other users contacts' });
  }
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;
