import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import javaRoutes from './routes/java';
import { errorHandler, ApiError } from './middleware/errorHandler';
import { RateLimiter } from './middleware/rateLimiter';

dotenv.config();

export function createServer(): Express {
  const app = express();

  // ==================== Middleware ====================

  // CORS 설정
  const corsOptions = {
    origin: true, // Allow any origin, reflects request origin
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // 요청 파싱
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // DEBUG LOGGER
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // ==================== Rate Limiting ====================

  // TTS 엔드포인트: 분당 10개
  const ttsLimiter = new RateLimiter(60000, 10);
  app.use('/api/tts', ttsLimiter.middleware());

  // 일반 엔드포인트: 분당 100개
  const generalLimiter = new RateLimiter(60000, 100);
  app.use('/api', generalLimiter.middleware());

  // ==================== Routes ====================

  // ==================== Routes ====================

  // Java Execution 라우트 (특수 경로 우선)
  app.use('/api/java', javaRoutes);

  // API 라우트 (일반 경로)
  app.use('/api', apiRoutes);

  // 정적 파일
  const dataPath = path.join(__dirname, '../data');
  app.use('/images', express.static(path.join(dataPath, 'images')));
  app.use('/audio', express.static(path.join(dataPath, 'audio')));

  // 루트 경로
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: '🦁 Animal Forest Coding API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        characters: '/api/characters',
        content: '/api/content/:character/:topic',
        topics: '/api/topics',
        images: '/api/images/:imageId',
        tts: '/api/tts',
        health: '/api/health',
      },
    });
  });

  // 404 처리
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '요청한 리소스를 찾을 수 없습니다',
        statusCode: 404,
      },
    });
  });

  // ==================== Error Handler ====================

  app.use(errorHandler);

  return app;
}

// ==================== Server Startup ====================

if (require.main === module) {
  const app = createServer();
  const PORT = parseInt(process.env.PORT || '5000', 10);
  const HOST = process.env.HOST || 'localhost';

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  🦁 Animal Forest Coding - Backend Server      ║
╠════════════════════════════════════════════════╣
║  Server: Running                               ║
║  Host: ${HOST.padEnd(36)}║
║  Port: ${PORT.toString().padEnd(36)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
║  Time: ${new Date().toISOString().padEnd(32)}║
╚════════════════════════════════════════════════╝

📚 Documentation:
  - Docs: docs/API.md
  - Health Check: http://${HOST}:${PORT}/api/health

🚀 Ready to accept requests!
    `);
  });
}
