require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const generateText = require('./jobs/generateText');
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

// generate_text worker
const genWorker = new Worker('generate_text', async job => {
  console.log('Processing generate_text job', job.id, job.data);
  const text = await generateText(job.data || {});
  console.log('Generated text:', text);
  // TODO: persist text to DB and enqueue next jobs (generate_front_art, assemble_card_pdf)
}, connection);

scanWorker.on('completed', job => console.log('scan completed', job.id));
scanWorker.on('failed', (job, err) => console.error('scan failed', job.id, err));

genWorker.on('completed', job => console.log('gen completed', job.id));
genWorker.on('failed', (job, err) => console.error('gen failed', job.id, err));

console.log('Workers started');
