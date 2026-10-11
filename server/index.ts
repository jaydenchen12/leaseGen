import express from 'express';
import { createServer } from 'vite';
import type { LeaseInput } from '../shared/types';
import { leasePacket } from './pdf';

const port = 3000;
const app = express();
app.use(express.json());

app.post('/api/lease', async (req, res) => {
  const pdf = await leasePacket(req.body as LeaseInput);
  res.type('application/pdf').send(Buffer.from(pdf));
});

const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
app.use(vite.middlewares);

app.use(((err, _req, res, _next) => {
  console.error(err);
  res.status(500).type('text/plain').send(err instanceof Error ? err.message : String(err));
}) as express.ErrorRequestHandler);

app.listen(port, () => console.log(`Lease Generator: http://localhost:${port}`));
