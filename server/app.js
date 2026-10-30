import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './routes/api.js';
import { errorHandler, notFound } from './middleware.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicFiles = ['index.html', 'styles.css', 'app.js', 'data.js', 'brand-mark.svg', 'onboarding-375.png'];

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/_app/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRouter);
app.get('/', (_req, res) => res.sendFile(resolve(projectRoot, 'index.html')));
for (const file of publicFiles) app.get(`/${file}`, (_req, res) => res.sendFile(resolve(projectRoot, file)));

app.use(notFound);
app.use(errorHandler);
