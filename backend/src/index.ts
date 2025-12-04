import { createServer } from './server';
import { databaseService } from './services/DatabaseService';

const app = createServer();
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || 'localhost';

// 데이터베이스 초기화 및 헬스 체크
const dbHealth = databaseService.health();
if (!dbHealth) {
  console.error('❌ Database health check failed. Exiting...');
  process.exit(1);
}

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🦁 Animal Forest Coding - Backend             ║
╠════════════════════════════════════════════════╣
║  ✅ Server is running                         ║
║  🌐 URL: http://${HOST}:${PORT.toString().padEnd(19)}║
║  📚 API: http://${HOST}:${PORT.toString().padEnd(14)}/api     ║
║  💚 Health: http://${HOST}:${PORT.toString().padEnd(10)}/api/health║
╚════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('📍 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    databaseService.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📍 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    databaseService.close();
    process.exit(0);
  });
});
