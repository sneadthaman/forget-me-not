const express = require('express');
const supabase = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

async function getContactById(contactId) {
  return supabase
    .from('contacts')
    .select('id, user_id')
    .eq('id', contactId)
    .single();
}

async function ensureContactOwnership(contactId, userId) {
  const { data, error } = await getContactById(contactId);
  if (error || !data) {
    return { status: 404, error: 'contact_not_found' };
  }
  if (data.user_id !== userId) {
    return { status: 403, error: 'forbidden' };
  }
  return { status: 200 };
}

async function ensureOccasionOwnership(occasionId, userId) {
  const { data: occasion, error } = await supabase
    .from('occasions')
    .select('id, contact_id')
    .eq('id', occasionId)
    .single();
  if (error || !occasion) {
    return { status: 404, error: 'occasion_not_found' };
  }
  return ensureContactOwnership(occasion.contact_id, userId);
}

// Update occasion (PATCH)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const ownership = await ensureOccasionOwnership(id, req.user.id);
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error });
  }
  const { data, error } = await supabase
    .from('occasions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error });
  if (!data || !data.length) return res.status(404).json({ error: 'occasion_not_found' });
  res.json(data[0]);
});

// Delete occasion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const ownership = await ensureOccasionOwnership(id, req.user.id);
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error });
  }
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
  const { data: contacts, error: contactErr } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', req.user.id);
  if (contactErr) return res.status(400).json({ error: contactErr });
  const contactIds = contacts.map(c => c.id);
  if (!contactIds.length) {
    return res.json([]);
  }
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .in('contact_id', contactIds);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create occasion
router.post('/', async (req, res) => {
  const occasion = req.body;
  const ownership = await ensureContactOwnership(occasion.contact_id, req.user.id);
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error });
  }
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
  const ownership = await ensureContactOwnership(contact_id, req.user.id);
  if (ownership.error) {
    return res.status(ownership.status).json({ error: ownership.error });
  }
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .eq('contact_id', contact_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;
