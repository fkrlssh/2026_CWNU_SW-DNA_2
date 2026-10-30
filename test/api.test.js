import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const testDir = mkdtempSync(join(tmpdir(), 'haru-api-'));
process.env.HARU_DB_PATH = join(testDir, 'test.sqlite');
process.env.NODE_ENV = 'test';
delete process.env.OPENAI_API_KEY; // 테스트는 토큰을 쓰지 않는다. 키가 없으면 챗봇은 degraded 응답을 돌려준다.

const { app } = await import('../server/app.js');
const { db } = await import('../server/db.js');

const server = await new Promise((resolve) => {
  const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
});
const baseUrl = `http://127.0.0.1:${server.address().port}`;

async function request(path, { method = 'GET', userId, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { response, json: await response.json() };
}

test('백엔드 B 핵심 API 흐름', async () => {
  const health = await request('/_app/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.json.status, 'ok');

  const created = await request('/api/users', { method: 'POST' });
  assert.equal(created.response.status, 201);
  const userId = created.json.userId;
  assert.match(userId, /^[0-9a-f-]{36}$/);

  const profile = { food: ['한식', '분식', '일식'], style: [], activity: [], budgetRange: '보통' };
  const savedProfile = await request('/api/profile', { method: 'PUT', userId, body: { answers: profile } });
  assert.equal(savedProfile.response.status, 200);
  assert.deepEqual(savedProfile.json.profile, profile);

  const generated = await request('/api/rules/generate', { method: 'POST', userId });
  assert.equal(generated.response.status, 202);
  assert.equal(generated.json.status, 'fallback');

  const recommended = await request('/api/recommend', {
    method: 'POST', userId,
    body: { category: 'eat', context: { mood: '피곤', budget: '저렴', time: '10분', mode: '집밥' } }
  });
  assert.equal(recommended.response.status, 200);
  assert.equal(recommended.json.items.length, 3);
  assert.ok(recommended.json.items.every(({ item }) => item.minutes <= 20), '10분 요청에는 20분 넘는 메뉴를 내지 않는다');

  const item = recommended.json.items[0].item;
  const decision = await request('/api/decisions', {
    method: 'POST', userId, body: { category: 'eat', itemId: item.id, context: { mood: '피곤' } }
  });
  assert.equal(decision.response.status, 201);

  const feedback = await request(`/api/decisions/${decision.json.decisionId}/feedback`, {
    method: 'POST', userId, body: { rating: 'good' }
  });
  assert.equal(feedback.response.status, 200);
  assert.equal(feedback.json.rulesUpdated, true);

  const savedWeights = () => JSON.parse(db.prepare('SELECT rules FROM rules WHERE user_id = ?').get(userId).rules).weights.always;
  const afterFirst = savedWeights();
  await request(`/api/decisions/${decision.json.decisionId}/feedback`, { method: 'POST', userId, body: { rating: 'good' } });
  assert.deepEqual(savedWeights(), afterFirst, '같은 평가를 다시 보내도 중복 반영하지 않는다');

  const chatted = await request('/api/chat', {
    method: 'POST', userId, body: { messages: [{ role: 'user', content: '저녁 뭐 먹죠?' }] }
  });
  assert.equal(chatted.response.status, 200);
  assert.equal(chatted.json.degraded, true);
  assert.equal(typeof chatted.json.reply, 'string');
  assert.deepEqual(chatted.json.recommendations, []);

  const badChat = await request('/api/chat', { method: 'POST', userId, body: { messages: [{ role: 'assistant', content: 'x' }] } });
  assert.equal(badChat.response.status, 400);
  assert.equal(badChat.json.error.code, 'INVALID_MESSAGES');

  const history = await request('/api/history', { userId });
  assert.equal(history.response.status, 200);
  assert.equal(history.json.history.length, 1);
  assert.equal(history.json.history[0].rating, 'good');
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  rmSync(testDir, { recursive: true, force: true });
});
