const express = require('express');
const supabase = require('../db');
const router = express.Router();

// Update occasion (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('occasions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

// Delete occasion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('occasions')
    .delete()
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ deleted: !!data.length, id });
});


// Get all occasions
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('occasions')
    .select('*');
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create occasion
router.post('/', async (req, res) => {
  const occasion = req.body;
  const { data, error } = await supabase
    .from('occasions')
    .insert([occasion])
    .select();
  if (error) return res.status(400).json({ error });
  res.json(data[0]);
});

// Get occasions for contact
router.get('/contact/:contact_id', async (req, res) => {
  const { contact_id } = req.params;
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .eq('contact_id', contact_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;
