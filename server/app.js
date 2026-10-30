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
const allowedOrigins = new Set((process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean));

function hasSameHost(origin, req) {
  if (!origin) return false;
  try {
    return new URL(origin).host.toLowerCase() === (req.get('host') || '').trim().toLowerCase();
  } catch {
    return false;
  }
}

function allowOrigin(origin, req, callback) {
  const developmentDefault = process.env.NODE_ENV !== 'production' && allowedOrigins.size === 0;
  if (!origin || hasSameHost(origin, req) || developmentDefault || allowedOrigins.has(origin)) return callback(null, true);
  callback(Object.assign(new Error('허용되지 않은 웹 출처입니다.'), { status: 403, code: 'CORS_ORIGIN_DENIED' }));
}

export const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => cors({ origin: (origin, callback) => allowOrigin(origin, req, callback) })(req, res, next));
app.use(express.json({ limit: '256kb' }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/_app/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRouter);
app.get('/', (_req, res) => res.sendFile(resolve(projectRoot, 'index.html')));
for (const file of publicFiles) app.get(`/${file}`, (_req, res) => res.sendFile(resolve(projectRoot, file)));
// 새 프론트의 ES 모듈 폴더. 이 폴더만 열어 두고 나머지 루트 파일은 위 고정 목록으로 제한한다.
app.use('/js', express.static(resolve(projectRoot, 'js'), { index: false }));

app.use(notFound);
app.use(errorHandler);
