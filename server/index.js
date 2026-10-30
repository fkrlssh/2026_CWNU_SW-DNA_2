import { app } from './app.js';

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`하루 API 서버: http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} 수신: 서버를 종료합니다.`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
