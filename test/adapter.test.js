import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeContext, normalizeProfile } from '../server/recommendation-adapter.js';

test('normalizeContext: 프론트 상황 라벨을 엔진 키로 바꾼다', () => {
  assert.deepEqual(
    normalizeContext({ mood: '피곤', budget: '저렴', time: '10분', mode: '집에서', with: '혼자', weather: 'rain' }),
    { mood: 'tired', budget: 'low', time: '10', mode: 'home', with: 'alone', weather: 'rain' },
  );
  assert.deepEqual(normalizeContext({ mode: '집콕', with: '같이' }), { mode: 'home', with: 'friend' });
  assert.deepEqual(normalizeContext({ mode: '출근·약속' }), { mode: 'out' });
});

test('normalizeContext: 이미 엔진 키인 값은 그대로 둔다', () => {
  assert.deepEqual(normalizeContext({ mode: 'home', with: 'alone' }), { mode: 'home', with: 'alone' });
});

test('normalizeProfile: 프론트 프로필 형식을 엔진 답변 형식으로 바꾼다', () => {
  const answers = normalizeProfile({ food: ['한식', '샐러드'], budgetRange: '조금 여유롭게', radiusKm: 1, allergies: ['갑각류'], dislikes: ['오이'] });
  assert.deepEqual(answers.foods, ['한식', '샐러드']);
  assert.equal(answers.budget, 'high');
  assert.equal(answers.radiusKm, 1);
  assert.deepEqual(answers.allergies, ['갑각류']);
  assert.deepEqual(answers.dislikes, ['오이']);
});
