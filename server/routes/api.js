import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db, parseJson } from '../db.js';
import { requireUser } from '../middleware.js';
import {
  applyFeedbackToRules,
  createRules,
  findCatalogItem,
  profileHash,
  recommendWithRules,
} from '../recommendation-adapter.js';
import { fetchContext } from '../weather.js';

export const apiRouter = Router();

async function getOrCreateRules(userId, profile) {
  const answersHash = profileHash(profile);
  const saved = db.prepare('SELECT rules, answers_hash FROM rules WHERE user_id = ?').get(userId);
  if (saved?.answers_hash === answersHash) return parseJson(saved.rules, null);

  const rules = await createRules(profile);
  db.prepare(`
    INSERT INTO rules (user_id, rules, source, answers_hash, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET rules = excluded.rules, source = excluded.source,
      answers_hash = excluded.answers_hash, created_at = CURRENT_TIMESTAMP
  `).run(userId, JSON.stringify(rules), rules.meta?.source || 'fallback', answersHash);
  return rules;
}

apiRouter.post('/users', (_req, res) => {
  const userId = randomUUID();
  db.prepare('INSERT INTO users (id) VALUES (?)').run(userId);
  res.status(201).json({ userId });
});

apiRouter.use(requireUser);

apiRouter.get('/profile', (req, res) => {
  const row = db.prepare('SELECT answers, updated_at FROM profiles WHERE user_id = ?').get(req.userId);
  res.json({ profile: row ? parseJson(row.answers, {}) : null, updatedAt: row?.updated_at || null });
});

apiRouter.put('/profile', (req, res, next) => {
  if (!req.body?.answers || typeof req.body.answers !== 'object' || Array.isArray(req.body.answers)) {
    return next(Object.assign(new Error('answers 객체가 필요합니다.'), { status: 400, code: 'INVALID_PROFILE' }));
  }
  db.prepare(`
    INSERT INTO profiles (user_id, answers, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET answers = excluded.answers, updated_at = CURRENT_TIMESTAMP
  `).run(req.userId, JSON.stringify(req.body.answers));
  res.json({ profile: req.body.answers });
});

apiRouter.post('/rules/generate', async (req, res, next) => {
  const profile = db.prepare('SELECT answers FROM profiles WHERE user_id = ?').get(req.userId);
  if (!profile) return next(Object.assign(new Error('프로필을 먼저 저장해주세요.'), { status: 409, code: 'PROFILE_REQUIRED' }));
  try {
    const rules = await getOrCreateRules(req.userId, parseJson(profile.answers, {}));
    res.status(202).json({ status: rules.meta?.source || 'fallback', persona: rules.persona });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/context', async (_req, res) => res.json(await fetchContext()));

apiRouter.post('/recommend', async (req, res, next) => {
  const { category, context = {}, refine = null, excludeIds = [] } = req.body || {};
  if (!['eat', 'wear', 'do'].includes(category)) {
    return next(Object.assign(new Error('category는 eat, wear, do 중 하나여야 합니다.'), { status: 400, code: 'INVALID_CATEGORY' }));
  }
  const row = db.prepare('SELECT answers FROM profiles WHERE user_id = ?').get(req.userId);
  const profile = row ? parseJson(row.answers, {}) : {};
  try {
    const rules = await getOrCreateRules(req.userId, profile);
    const items = recommendWithRules({ rules, category, context, refine, excludeIds });
    res.json({ items, engine: rules.meta?.source || 'fallback' });
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/decisions', (req, res, next) => {
  const { category, itemId, context = {} } = req.body || {};
  if (!findCatalogItem(category, itemId)) {
    return next(Object.assign(new Error('카탈로그에서 항목을 찾을 수 없습니다.'), { status: 400, code: 'ITEM_NOT_FOUND' }));
  }
  const decisionId = randomUUID();
  db.prepare('INSERT INTO decisions (id, user_id, category, item_id, context) VALUES (?, ?, ?, ?, ?)')
    .run(decisionId, req.userId, category, itemId, JSON.stringify(context));
  res.status(201).json({ decisionId });
});

apiRouter.post('/decisions/:id/feedback', (req, res, next) => {
  const { rating } = req.body || {};
  if (!['good', 'soso', 'bad'].includes(rating)) {
    return next(Object.assign(new Error('rating은 good, soso, bad 중 하나여야 합니다.'), { status: 400, code: 'INVALID_RATING' }));
  }
  const decision = db.prepare('SELECT id, category, item_id FROM decisions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!decision) return next(Object.assign(new Error('결정 기록을 찾을 수 없습니다.'), { status: 404, code: 'DECISION_NOT_FOUND' }));
  db.prepare(`
    INSERT INTO feedback (decision_id, rating, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(decision_id) DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP
  `).run(req.params.id, rating);
  const savedRules = db.prepare('SELECT rules FROM rules WHERE user_id = ?').get(req.userId);
  if (savedRules) {
    const rules = parseJson(savedRules.rules, null);
    if (rules) {
      const nextRules = applyFeedbackToRules(rules, decision.category, decision.item_id, rating);
      db.prepare('UPDATE rules SET rules = ? WHERE user_id = ?').run(JSON.stringify(nextRules), req.userId);
    }
  }
  res.json({ decisionId: req.params.id, rating, rulesUpdated: Boolean(savedRules) });
});

apiRouter.get('/history', (req, res) => {
  const rows = db.prepare(`
    SELECT d.id, d.category, d.item_id, d.context, d.created_at, f.rating
    FROM decisions d LEFT JOIN feedback f ON f.decision_id = d.id
    WHERE d.user_id = ? ORDER BY d.created_at DESC LIMIT 100
  `).all(req.userId);
  const history = rows.map((row) => ({
    id: row.id, category: row.category, itemId: row.item_id,
    item: findCatalogItem(row.category, row.item_id), context: parseJson(row.context, {}),
    rating: row.rating || null, createdAt: row.created_at
  }));
  const tagCounts = new Map();
  for (const record of history) for (const tag of record.item?.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  const favoriteTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
  res.json({ history, summary: { favoriteTags } });
});
