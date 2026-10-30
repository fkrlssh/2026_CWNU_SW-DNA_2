import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateRules, resolveRulesProvider } from '../ai/generateRules.js';
import { RULES_SCHEMA, createRulesApiRunner, toRulesJson } from '../ai/rulesApi.js';
import { validateRules } from '../ai/validate.js';

const answers = { foods: ['한식', '분식'], budget: 'low', radiusKm: 1, allergies: ['seafood'], noveltyPref: 'new' };

// 모델이 돌려줄 법한 구조화 출력(배열 형태). weights 20개, reasons 8개.
function structuredSample() {
  const weights = [];
  const pairs = [
    ['always', ['tag.한식', 'tag.분식', 'tag.comfort', 'tag.light']],
    ['mood.tired', ['tag.light', 'tag.delivery', 'tag.outdoor', 'tag.comfort']],
    ['mood.good', ['tag.outdoor', 'tag.group', 'tag.산책']],
    ['budget.low', ['price.1', 'price.2', 'price.3']],
    ['weather.rain', ['tag.indoor', 'tag.outdoor', 'tag.delivery']],
    ['with.friend', ['tag.group', 'tag.solo', 'tag.문화생활']],
  ];
  for (const [key, features] of pairs) for (const feature of features) weights.push({ key, feature, delta: feature.includes('outdoor') || feature === 'price.3' || feature === 'tag.solo' ? -2 : 1.5 });
  return {
    persona: '한식과 분식을 좋아하고 새로운 시도를 즐기는 알뜰파',
    weights,
    hard: { exclude_tags: ['seafood'], exclude_types: [], max_price_level: 1, radius_km: 1 },
    novelty: 0.6,
    reasons: ['tag.한식', 'tag.분식', 'tag.light', 'tag.delivery', 'tag.indoor', 'tag.group', 'price.1', 'tag.comfort'].map((feature) => ({ feature, text: `${feature.split('.')[1]} 이유예요` })),
  };
}

function fakeFetch(payloads) {
  const bodies = [];
  const fetchImpl = async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    const next = payloads.shift();
    return new Response(JSON.stringify({ status: 'completed', output_text: JSON.stringify(next), usage: { input_tokens: 900, output_tokens: 700 } }), { status: 200 });
  };
  return { fetchImpl, bodies };
}

test('스키마는 strict 모드 규칙(additionalProperties false, required 전부)을 지킨다', () => {
  const check = (schema, path = '$') => {
    if (schema.type === 'object') {
      assert.equal(schema.additionalProperties, false, `${path}: additionalProperties`);
      assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort(), `${path}: required 와 properties 불일치`);
      for (const [name, child] of Object.entries(schema.properties)) check(child, `${path}.${name}`);
    }
    if (schema.type === 'array') check(schema.items, `${path}[]`);
  };
  check(RULES_SCHEMA);
});

test('toRulesJson: 배열 출력을 AGENTS.md 형식 객체로 바꾸고 검증기를 통과한다', () => {
  const rules = toRulesJson(structuredSample());
  assert.equal(rules.version, 1);
  assert.equal(rules.weights.always['tag.한식'], 1.5);
  assert.equal(rules.weights['budget.low']['price.3'], -2);
  assert.equal(rules.reasons['price.1'], '1 이유예요');
  assert.deepEqual(validateRules(rules, answers), []);
});

test('API 제공자: 구조화 출력 형식과 지시문을 보내고 규칙 JSON 을 돌려준다', async () => {
  const { fetchImpl, bodies } = fakeFetch([structuredSample()]);
  const run = createRulesApiRunner({ apiKey: 'k', fetchImpl, model: 'test-model' });
  const rules = await run('프롬프트');
  assert.equal(bodies[0].text.format.type, 'json_schema');
  assert.equal(bodies[0].text.format.strict, true);
  assert.equal(bodies[0].model, 'test-model');
  assert.equal(bodies[0].store, false);
  assert.match(bodies[0].instructions, /weights 는 전체 20~45개/);
  assert.equal(rules.persona, structuredSample().persona);
  assert.equal(createRulesApiRunner({ apiKey: '' }), null);
});

test('generateRules + API 제공자: 검증 실패 1회는 오류를 알려 재시도하고 성공하면 source 가 api', async () => {
  const bad = structuredSample();
  bad.weights = bad.weights.slice(0, 5); // 20개 미만 → 검증 실패
  const { fetchImpl, bodies } = fakeFetch([bad, structuredSample()]);
  const run = createRulesApiRunner({ apiKey: 'k', fetchImpl });
  const rules = await generateRules({ ...answers, radiusKm: 71 }, { run, source: 'api' });
  assert.equal(bodies.length, 2);
  assert.match(bodies[1].input, /검증 오류를 고쳐라/);
  assert.equal(rules.meta.source, 'api');
});

test('resolveRulesProvider: 환경변수로 제공자를 고르고 키가 없으면 폴백', () => {
  assert.equal(resolveRulesProvider({}).name, 'fallback');
  assert.equal(resolveRulesProvider({ OPENAI_API_KEY: 'k' }).name, 'api');
  assert.equal(resolveRulesProvider({ OPENAI_API_KEY: 'k', RULES_PROVIDER: 'fallback' }).name, 'fallback');
  assert.equal(resolveRulesProvider({ RULES_PROVIDER: 'api' }).name, 'fallback', '키 없이 api 를 고르면 폴백');
  assert.equal(resolveRulesProvider({ CODEX_ENABLED: 'true' }).name, 'codex');
  assert.equal(resolveRulesProvider({ OPENAI_API_KEY: 'k', RULES_PROVIDER: 'codex' }).name, 'codex');
});

test('generateRules: run 이 null 이면 AI 호출 없이 폴백 규칙을 돌려준다', async () => {
  const rules = await generateRules({ ...answers, radiusKm: 72 }, { run: null });
  assert.equal(rules.meta.source, 'fallback');
  assert.deepEqual(rules.hard.exclude_tags, ['seafood']);
});
