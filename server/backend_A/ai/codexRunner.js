import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'agent-template');
const TIMEOUT_MS = Number(process.env.CODEX_TIMEOUT_MS ?? 90_000);
const MAX_CONCURRENT = Number(process.env.CODEX_CONCURRENCY ?? 2);

let running = 0;
const waiting = [];

// 공유 키 보호용 동시 실행 제한
async function withSlot(task) {
  if (running >= MAX_CONCURRENT) {
    await new Promise((resolve) => waiting.push(resolve));
  } else {
    running += 1;
  }
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running -= 1;
  }
}

function killTree(child) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  } else {
    child.kill('SIGKILL');
  }
}

function execCodex(prompt, cwd) {
  return new Promise((resolve, reject) => {
    // 프롬프트는 사용자 입력을 담으므로 인자가 아니라 stdin 으로 넘긴다.
    const child = spawn(
      process.env.CODEX_BIN ?? 'codex',
      ['exec', '--sandbox', 'workspace-write', '--skip-git-repo-check', '-'],
      { cwd, shell: process.platform === 'win32', stdio: ['pipe', 'ignore', 'pipe'] },
    );
    let stderr = '';
    const timer = setTimeout(() => {
      killTree(child);
      reject(new Error(`codex 타임아웃 (${TIMEOUT_MS}ms)`));
    }, TIMEOUT_MS);

    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.stdin.on('error', () => {}); // 실행 실패 시 EPIPE 는 close 에서 처리
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`codex 종료 코드 ${code}: ${stderr.slice(-500)}`));
    });
    child.stdin.end(prompt);
  });
}

// 요청마다 임시 작업 폴더를 만들어 output/rules.json 충돌을 막는다.
export function runCodex(prompt) {
  return withSlot(async () => {
    const workDir = await mkdtemp(join(tmpdir(), 'haru-agent-'));
    try {
      await cp(TEMPLATE_DIR, workDir, { recursive: true });
      await mkdir(join(workDir, 'output'), { recursive: true });
      await execCodex(prompt, workDir);
      return JSON.parse(await readFile(join(workDir, 'output', 'rules.json'), 'utf8'));
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });
}
