require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const generateText = require('./jobs/generateText');
const generateFrontArt = require('./jobs/generateFrontArt');
const assembleCardPdf = require('./jobs/assembleCardPdf');
const supabase = require('./db');

const connection = { connection: { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' } };

console.log('Worker connecting to', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// scan_upcoming_dates worker
const scanWorker = new Worker('scan_upcoming_dates', async job => {
  console.log('Processing scan_upcoming_dates job', job.id, job.data);
  // TODO: query DB for occasions matching lead times and enqueue card_jobs
  // Example: push generate_text job for each card
  const generateQueue = new Queue('generate_text', connection);
  await generateQueue.add('generate_text', { example: true });
}, connection);

async function fetchCardJobContext(cardJobId) {
  const { data: job, error: jobErr } = await supabase
    .from('card_jobs')
    .select('*')
    .eq('id', cardJobId)
    .single();
  if (jobErr) throw jobErr;
  const [{ data: contact, error: contactErr }, { data: occasion, error: occasionErr }, { data: user, error: userErr }] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', job.contact_id).single(),
    supabase.from('occasions').select('*').eq('id', job.occasion_id).single(),
    supabase.from('users').select('*').eq('id', job.user_id).single(),
  ]);
  if (contactErr) throw contactErr;
  if (occasionErr) throw occasionErr;
  if (userErr) throw userErr;
  return { job, contact, occasion, user };
}

async function updateCardJob(cardJobId, updates) {
  const { error } = await supabase
    .from('card_jobs')
    .update(updates)
    .eq('id', cardJobId);
  if (error) throw error;
}

// generate_text worker
const genWorker = new Worker('generate_text', async job => {
  console.log('Processing generate_text job', job.id, job.data);

  if (!job.data || !job.data.card_job_id) {
    throw new Error('generate_text job missing card_job_id');
  }

  const { job: cardJob, contact, occasion, user } = await fetchCardJobContext(job.data.card_job_id);

  const text = await generateText({
    recipientName: contact?.name,
    occasionType: occasion?.occasion_type || occasion?.type || 'custom',
    relationship: contact?.relationship,
    tone: occasion?.tone_preference || user?.default_card_tone || 'warm',
    senderName: user?.name,
    interests: [], // placeholder until we store interests/hobbies
    customLabel: occasion?.custom_label,
  });

  await updateCardJob(cardJob.id, { message_text: text });

  // Enqueue next step: generate front art
  const frontArtQueue = new Queue('generate_front_art', connection);
  await frontArtQueue.add('generate_front_art', { card_job_id: cardJob.id });

  console.log(`generate_text completed for card_job ${cardJob.id}`);
}, connection);

// generate_front_art worker
const artWorker = new Worker('generate_front_art', async job => {
  console.log('Processing generate_front_art job', job.id, job.data);

  if (!job.data || !job.data.card_job_id) {
    throw new Error('generate_front_art job missing card_job_id');
  }

  const { job: cardJob, occasion, contact, user } = await fetchCardJobContext(job.data.card_job_id);
  const artUrl = await generateFrontArt({
    cardJobId: cardJob.id,
    occasionType: occasion?.occasion_type || occasion?.type || 'custom',
    tone: occasion?.tone_preference || user?.default_card_tone || 'warm',
    contactName: contact?.name,
  });

  await updateCardJob(cardJob.id, { front_art_url: artUrl });

  // Enqueue next step: assemble PDF
  const pdfQueue = new Queue('assemble_card_pdf', connection);
  await pdfQueue.add('assemble_card_pdf', { card_job_id: cardJob.id });

  console.log(`generate_front_art completed for card_job ${cardJob.id}`);
}, connection);

// assemble_card_pdf worker
const pdfWorker = new Worker('assemble_card_pdf', async job => {
  console.log('Processing assemble_card_pdf job', job.id, job.data);

  if (!job.data || !job.data.card_job_id) {
    throw new Error('assemble_card_pdf job missing card_job_id');
  }

  const { job: cardJob } = await fetchCardJobContext(job.data.card_job_id);
  const pdfUrl = await assembleCardPdf({ cardJobId: cardJob.id });

  await updateCardJob(cardJob.id, { pdf_url: pdfUrl, status: 'ready_to_print' });

  console.log(`assemble_card_pdf completed for card_job ${cardJob.id}`);
}, connection);

scanWorker.on('completed', job => console.log('scan completed', job.id));
scanWorker.on('failed', (job, err) => console.error('scan failed', job.id, err));

genWorker.on('completed', job => console.log('gen completed', job.id));
genWorker.on('failed', (job, err) => console.error('gen failed', job.id, err));

artWorker.on('completed', job => console.log('art completed', job.id));
artWorker.on('failed', (job, err) => console.error('art failed', job.id, err));

pdfWorker.on('completed', job => console.log('pdf completed', job.id));
pdfWorker.on('failed', (job, err) => console.error('pdf failed', job.id, err));

console.log('Workers started');
