import { db } from './db.js';

export function requireUser(req, _res, next) {
  const userId = req.get('X-User-Id');
  if (!userId) {
    return next(Object.assign(new Error('X-User-Id 헤더가 필요합니다.'), { status: 401, code: 'USER_ID_REQUIRED' }));
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return next(Object.assign(new Error('등록되지 않은 사용자입니다.'), { status: 401, code: 'USER_NOT_FOUND' }));
  }

  req.userId = userId;
  next();
}

export function notFound(req, _res, next) {
  next(Object.assign(new Error(`경로를 찾을 수 없습니다: ${req.method} ${req.path}`), { status: 404, code: 'NOT_FOUND' }));
}

export function errorHandler(error, _req, res, _next) {
  const invalidJson = error.type === 'entity.parse.failed';
  const tooLarge = error.type === 'entity.too.large';
  const status = invalidJson ? 400 : tooLarge ? 413 : Number(error.status) || 500;
  const code = invalidJson ? 'INVALID_JSON' : tooLarge ? 'PAYLOAD_TOO_LARGE' : error.code || 'INTERNAL_ERROR';
  if (status >= 500) console.error(error);
  const message = invalidJson ? '올바른 JSON 요청이 아닙니다.'
    : tooLarge ? '요청 본문이 너무 큽니다.'
      : status >= 500 ? '서버 오류가 발생했습니다.' : error.message;
  res.status(status).json({ error: { code, message } });
}
