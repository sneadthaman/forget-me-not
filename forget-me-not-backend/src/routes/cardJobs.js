const express = require('express');
const { Queue } = require('bullmq');
const supabase = require('../db');
const requireAuth = require('../middleware/auth');
const router = express.Router();

const connection = { connection: { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' } };
const generateTextQueue = new Queue('generate_text', connection);
const generateFrontArtQueue = new Queue('generate_front_art', connection);
const assemblePdfQueue = new Queue('assemble_card_pdf', connection);

router.use(requireAuth);

// List card jobs for the authenticated user
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('card_jobs')
    .select('*')
    .eq('user_id', req.user.id)
    .order('id', { ascending: false });
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Get a single card job by id (scoped to user)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('card_jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'card_job_not_found' });
  res.json(data);
});

// Trigger actions on a card job (e.g., re-run generation steps)
router.post('/:id/actions/:action', async (req, res) => {
  const { id, action } = req.params;

  const { data: job, error } = await supabase
    .from('card_jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  if (error || !job) return res.status(404).json({ error: 'card_job_not_found' });

  const payload = { card_job_id: job.id };
  if (action === 'generate_text') {
    await generateTextQueue.add('generate_text', payload);
    return res.json({ enqueued: true, action });
  }
  if (action === 'generate_front_art') {
    await generateFrontArtQueue.add('generate_front_art', payload);
    return res.json({ enqueued: true, action });
  }
  if (action === 'assemble_card_pdf') {
    await assemblePdfQueue.add('assemble_card_pdf', payload);
    return res.json({ enqueued: true, action });
  }

  return res.status(400).json({ error: 'unknown_action' });
});

// Allow manual edits (currently supports message_text only)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { message_text, status } = req.body;
  if (message_text === undefined && status === undefined) {
    return res.status(400).json({ error: 'no_updates' });
  }
  const { data: job, error: jobErr } = await supabase
    .from('card_jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  if (jobErr || !job) return res.status(404).json({ error: 'card_job_not_found' });

  const updates = {};
  if (message_text !== undefined) updates.message_text = message_text;
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabase
    .from('card_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(400).json({ error });
  return res.json(data);
});

module.exports = router;
