import { createHash } from 'node:crypto';
import { normalizeExclusions } from './allergens.js';
import { runCodex } from './codexRunner.js';
import { buildFallbackRules } from './fallback.js';
import { buildPrompt } from './prompt.js';
import { createRulesApiRunner } from './rulesApi.js';
import { validateRules } from './validate.js';

const MAX_ATTEMPTS = 2; // 최초 1회 + 재시도 1회

// 규칙 생성 제공자. RULES_PROVIDER=api|codex|fallback 로 고르고, 없으면 OPENAI_API_KEY 가 있을 때 api,
// CODEX_ENABLED=true 면 codex, 아니면 fallback. 반환이 null 이면 AI 호출 없이 폴백 규칙만 쓴다.
export function resolveRulesProvider(env = process.env) {
  const requested = env.RULES_PROVIDER ?? (env.CODEX_ENABLED === 'true' ? 'codex' : env.OPENAI_API_KEY ? 'api' : 'fallback');
  if (requested === 'api') {
    const run = createRulesApiRunner({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_RULES_MODEL ?? env.OPENAI_CHAT_MODEL ?? undefined });
    return run ? { name: 'api', run } : { name: 'fallback', run: null };
  }
  if (requested === 'codex') return { name: 'codex', run: runCodex };
  return { name: 'fallback', run: null };
}
const cache = new Map(); // 프로세스 메모리 캐시. 재시작에도 유지하려면 B의 rules.answers_hash 를 조회한다.

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function hashAnswers(answers) {
  return createHash('sha256').update(JSON.stringify(canonicalize(answers))).digest('hex');
}

// 반환값의 meta 는 B가 rules 테이블의 source·answers_hash 에 저장한다. run 이 null 이면 바로 폴백 규칙.
export async function generateRules(profileAnswers, { run = runCodex, source = 'codex' } = {}) {
  const answersHash = hashAnswers(profileAnswers);
  if (cache.has(answersHash)) return structuredClone(cache.get(answersHash));
  if (!run) {
    const answers = { ...profileAnswers, allergies: normalizeExclusions(profileAnswers.allergies), dislikes: normalizeExclusions(profileAnswers.dislikes) };
    return { ...buildFallbackRules(answers), meta: { source: 'fallback', answersHash } };
  }

  const answers = {
    ...profileAnswers,
    allergies: normalizeExclusions(profileAnswers.allergies),
    dislikes: normalizeExclusions(profileAnswers.dislikes),
  };
  let errors = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const rules = await run(buildPrompt(answers, errors));
      errors = validateRules(rules, answers);
      if (errors.length === 0) {
        const result = { ...rules, meta: { source, answersHash } };
        cache.set(answersHash, result);
        return structuredClone(result);
      }
    } catch (err) {
      errors = [err.message];
    }
    console.warn(`[generateRules] ${attempt}차 실패: ${errors.join('; ')}`);
  }

  // 폴백은 캐시하지 않는다. 장애가 풀리면 다음 요청에서 Codex 를 다시 시도한다.
  return { ...buildFallbackRules(answers), meta: { source: 'fallback', answersHash } };
}
