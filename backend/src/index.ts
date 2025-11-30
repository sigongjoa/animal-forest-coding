import { createServer } from './server';

const app = createServer();
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || 'localhost';

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
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📍 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
