import { Router, Request, Response, NextFunction } from 'express';
import { ContentService } from '../services/ContentService';
import { ImageService } from '../services/ImageService';
import { AnimalesesTTSService } from '../services/AnimalesesTTSService';
import { ApiError } from '../middleware/errorHandler';
import feedbackRouter from './feedback';
import progressionRouter from './progression';
import storiesRouter from './stories';
import missionsRouter from './missions';
import adminRouter from './admin';

const router = Router();
const contentService = new ContentService();
const imageService = new ImageService();
const ttsService = new AnimalesesTTSService();

// 라우터 마운트
router.use(feedbackRouter);
router.use('/progression', progressionRouter);
router.use('/stories', storiesRouter);
router.use('/missions', missionsRouter);
router.use('/admin', adminRouter);

// ==================== Characters ====================

/**
 * GET /api/characters
 * 모든 사용 가능한 캐릭터 조회
 */
router.get('/characters', (req: Request, res: Response, next: NextFunction) => {
  try {
    const characters = contentService.getAllCharacters();

    if (!characters || characters.length === 0) {
      const error: ApiError = new Error('No characters found');
      error.statusCode = 404;
      error.code = 'NO_DATA';
      throw error;
    }

    res.json({
      success: true,
      data: characters,
      metadata: {
        count: characters.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Content ====================

/**
 * GET /api/content/:character/:topic
 * 특정 캐릭터와 주제의 콘텐츠 조회
 */
router.get(
  '/content/:character/:topic',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { character, topic } = req.params;

      if (!character || !topic) {
        const error: ApiError = new Error('Character and topic are required');
        error.statusCode = 400;
        error.code = 'MISSING_PARAMS';
        throw error;
      }

      const content = contentService.getContent(
        decodeURIComponent(character),
        topic
      );

      if (!content) {
        const error: ApiError = new Error('Content not found');
        error.statusCode = 404;
        error.code = 'CONTENT_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: content,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/topics
 * 모든 주제 조회 (필터링 지원)
 */
router.get('/topics', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty, limit = '20', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const topics = contentService.getAllTopics(difficulty as string | undefined);
    const paginatedTopics = topics.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedTopics,
      metadata: {
        count: paginatedTopics.length,
        totalCount: topics.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < topics.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search
 * 콘텐츠 검색
 */
router.get('/search', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      const error: ApiError = new Error('Query parameter is required');
      error.statusCode = 400;
      error.code = 'MISSING_QUERY';
      throw error;
    }

    const results = contentService.searchContent(q);

    res.json({
      success: true,
      data: results,
      metadata: {
        query: q,
        count: results.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Images ====================

/**
 * GET /api/images/:imageId
 * 이미지 조회
 */
router.get('/images/:imageId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      const error: ApiError = new Error('Image ID is required');
      error.statusCode = 400;
      error.code = 'MISSING_IMAGE_ID';
      throw error;
    }

    const image = imageService.getImage(imageId);
    const metadata = imageService.getImageMetadata(imageId);

    res.set('Content-Type', metadata.mimeType);
    res.set('Cache-Control', 'public, max-age=604800');
    res.set('ETag', `"${Buffer.from(metadata.id).toString('base64')}-${image.length}"`);
    res.set('Last-Modified', metadata.createdAt || new Date().toUTCString());

    res.send(image);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/images/:imageId/metadata
 * 이미지 메타데이터 조회
 */
router.get(
  '/images/:imageId/metadata',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageId } = req.params;

      if (!imageId) {
        const error: ApiError = new Error('Image ID is required');
        error.statusCode = 400;
        error.code = 'MISSING_IMAGE_ID';
        throw error;
      }

      const metadata = imageService.getImageMetadata(imageId);

      res.json({
        success: true,
        data: metadata,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== TTS ====================

/**
 * POST /api/tts
 * Animalese 음성 생성
 */
router.post('/tts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, character } = req.body;

    if (!text || !character) {
      const error: ApiError = new Error('Text and character are required');
      error.statusCode = 400;
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    if (typeof text !== 'string' || typeof character !== 'string') {
      const error: ApiError = new Error('Text and character must be strings');
      error.statusCode = 400;
      error.code = 'INVALID_TYPE';
      throw error;
    }

    const startTime = Date.now();
    const audio = await ttsService.generateTTS(text, character);
    const processingTime = Date.now() - startTime;

    res
      .type('audio/wav')
      .set('Content-Length', audio.length.toString())
      .set('Cache-Control', 'no-store')
      .send(audio);
  } catch (error) {
    next(error);
  }
});

// ==================== Health Check ====================

/**
 * GET /api/health
 * API 상태 확인
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      contentService: 'available',
      imageService: 'available',
      ttsService: 'available',
    },
  });
});

export default router;
