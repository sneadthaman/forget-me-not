# Forget Me Not – Autonomous Greeting Card App

This repository contains a starter backend + worker scaffold for the Forget Me Not service described in the developer handoff.

Quick start (development):

1. Copy `.env.example` to `.env` and fill in the variables.
2. Start Redis (via Docker Compose or your local Redis).

   docker-compose up -d

3. Install dependencies:

   npm install

4. Run the server:

   npm start

5. In another terminal run the worker:

   npm run worker

Project layout (starter):

- `src/server.js` — Express server with health endpoint and test job trigger
- `src/worker.js` — BullMQ worker which processes simple job types
- `src/jobs/` — sample job handlers (scanUpcoming, generateText)
- `docker-compose.yml` — includes `redis` for local development
- `.env.example` — environment variables example

This scaffold is intended to be a starting point. Follow the README in the handoff for architecture and design. Implement integrations (OpenAI, Stripe, Lob) and secure PII before production.
