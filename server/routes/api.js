import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db, parseJson } from '../db.js';
import { requireUser } from '../middleware.js';
import {
  applyFeedbackToRules,
  chatWithRules,
  createRules,
  findCatalogItem,
  placesForItem,
  profileHash,
  recommendWithRules,
} from '../recommendation-adapter.js';
import { fetchContext } from '../weather.js';
import {
  validateContext,
  validateDecision,
  validateExcludeIds,
  validateMessages,
  validatePlacesRequest,
  validateProfile,
  validateRefine,
} from '../validation.js';

export const apiRouter = Router();

async function getOrCreateRules(userId, profile, { retryFallback = false } = {}) {
  const answersHash = profileHash(profile);
  const saved = db.prepare('SELECT rules, source, answers_hash FROM rules WHERE user_id = ?').get(userId);
  // 장애로 저장된 폴백은 규칙 생성 요청 때 Codex 로 다시 시도한다.
  const retry = retryFallback && saved?.source === 'fallback' && process.env.CODEX_ENABLED === 'true';
  if (saved?.answers_hash === answersHash && !retry) return parseJson(saved.rules, null);

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
  try { validateProfile(req.body?.answers); } catch (error) { return next(error); }
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
    const rules = await getOrCreateRules(req.userId, parseJson(profile.answers, {}), { retryFallback: true });
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
  try {
    validateContext(context);
    validateRefine(refine);
    validateExcludeIds(excludeIds);
  } catch (error) { return next(error); }
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
  try { validateDecision({ category, itemId, context }); } catch (error) { return next(error); }
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
  const previousRating = db.prepare('SELECT rating FROM feedback WHERE decision_id = ?').get(req.params.id)?.rating;
  db.prepare(`
    INSERT INTO feedback (decision_id, rating, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(decision_id) DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP
  `).run(req.params.id, rating);
  const savedRules = db.prepare('SELECT rules FROM rules WHERE user_id = ?').get(req.userId);
  if (savedRules) {
    const rules = parseJson(savedRules.rules, null);
    if (rules) {
      // 평가를 바꾸면 이전 반영분을 되돌리고, 같은 평가를 다시 보내면 중복 반영하지 않는다.
      const opposite = { good: 'bad', bad: 'good' };
      let nextRules = rules;
      if (previousRating !== rating) {
        if (opposite[previousRating]) nextRules = applyFeedbackToRules(nextRules, decision.category, decision.item_id, opposite[previousRating]);
        nextRules = applyFeedbackToRules(nextRules, decision.category, decision.item_id, rating);
      }
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

// 챗봇은 메시지마다 토큰을 쓰므로 일반 API 보다 좁은 사용자별 제한을 둔다.
const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.CHAT_RATE_LIMIT_PER_MINUTE) || 20,
  keyGenerator: (req) => req.userId,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// 응답 본문: { reply, recommendations, degraded, engine }
// Accept: text/event-stream 이면 data: {"delta"} 조각을 흘려보낸 뒤 event: done 에 같은 본문을 담는다.
apiRouter.post('/chat', chatLimiter, async (req, res, next) => {
  const { messages, context = {}, excludeIds = [] } = req.body || {};
  try {
    validateMessages(messages);
    validateContext(context);
    validateExcludeIds(excludeIds);
  } catch (error) { return next(error); }
  const row = db.prepare('SELECT answers FROM profiles WHERE user_id = ?').get(req.userId);
  const profile = row ? parseJson(row.answers, {}) : {};
  const stream = (req.get('Accept') || '').includes('text/event-stream');
  try {
    const rules = await getOrCreateRules(req.userId, profile);
    if (stream) {
      res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.flushHeaders();
    }
    const result = await chatWithRules({
      rules, messages, context, excludeIds,
      onDelta: stream ? (delta) => res.write(`data: ${JSON.stringify({ delta })}\n\n`) : undefined,
    });
    console.log(`[chat] user=${req.userId} in=${result.usage.input_tokens} out=${result.usage.output_tokens} degraded=${result.degraded}`);
    const payload = {
      reply: result.reply, recommendations: result.recommendations,
      degraded: result.degraded, engine: rules.meta?.source || 'fallback',
    };
    if (!stream) return res.json(payload);
    res.write(`event: done\ndata: ${JSON.stringify(payload)}\n\n`);
    res.end();
  } catch (error) {
    if (!res.headersSent) return next(error);
    console.error(error);
    res.write('event: error\ndata: {"code":"CHAT_FAILED"}\n\n');
    res.end();
  }
});

// 추천 항목 근처의 실제 장소. 응답: { keyword, center, radiusKm, places, source }
// source 가 none(지도 없는 항목)·unavailable(키 없음)·error 면 places 는 빈 배열이다.
apiRouter.post('/places', async (req, res, next) => {
  const { category, itemId, radiusKm = null, location = null } = req.body || {};
  try { validatePlacesRequest({ category, itemId, radiusKm, location }); } catch (error) { return next(error); }
  if (!findCatalogItem(category, itemId)) {
    return next(Object.assign(new Error('카탈로그에서 항목을 찾을 수 없습니다.'), { status: 400, code: 'ITEM_NOT_FOUND' }));
  }
  const row = db.prepare('SELECT answers FROM profiles WHERE user_id = ?').get(req.userId);
  const profile = row ? parseJson(row.answers, {}) : {};
  try {
    const rules = await getOrCreateRules(req.userId, profile);
    const result = await placesForItem({
      rules, category, itemId, location,
      radiusKm: radiusKm === null ? undefined : Number(radiusKm),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
