import { createHash } from 'node:crypto';
import { runCodex } from './codexRunner.js';
import { buildFallbackRules } from './fallback.js';
import { buildPrompt } from './prompt.js';
import { validateRules } from './validate.js';

const MAX_ATTEMPTS = 2; // 최초 1회 + 재시도 1회
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

// 반환값의 meta 는 B가 rules 테이블의 source·answers_hash 에 저장한다.
export async function generateRules(profileAnswers, { run = runCodex } = {}) {
  const answersHash = hashAnswers(profileAnswers);
  if (cache.has(answersHash)) return structuredClone(cache.get(answersHash));

  let errors = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const rules = await run(buildPrompt(profileAnswers, errors));
      errors = validateRules(rules, profileAnswers);
      if (errors.length === 0) {
        const result = { ...rules, meta: { source: 'codex', answersHash } };
        cache.set(answersHash, result);
        return structuredClone(result);
      }
    } catch (err) {
      errors = [err.message];
    }
    console.warn(`[generateRules] ${attempt}차 실패: ${errors.join('; ')}`);
  }

  // 폴백은 캐시하지 않는다. 장애가 풀리면 다음 요청에서 Codex 를 다시 시도한다.
  return { ...buildFallbackRules(profileAnswers), meta: { source: 'fallback', answersHash } };
}
