require('dotenv').config();
const express = require('express');
const { Queue } = require('bullmq');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const connection = { connection: { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' } };

const scanQueue = new Queue('scan_upcoming_dates', { connection: connection.connection });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Trigger a scan job (for testing)
app.post('/jobs/scan', async (req, res) => {
  const job = await scanQueue.add('scan_upcoming_dates', { trigger: 'manual' });
  res.json({ enqueued: true, id: job.id });
});

// CRUD endpoints
app.use('/users', require('./routes/users'));
app.use('/contacts', require('./routes/contacts'));
app.use('/occasions', require('./routes/occasions'));

app.listen(PORT, () => console.log(`Forget Me Not API listening on ${PORT}`));

module.exports = app;
