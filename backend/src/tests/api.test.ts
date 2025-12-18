import request from 'supertest';
import { createServer } from '../server';
import { Express } from 'express';

describe('API Endpoints', () => {
  let app: Express;

  // Mock Services
  jest.mock('../services/AnimalesesTTSService', () => ({
    animalesesTTSService: {
      generateAudio: jest.fn().mockResolvedValue(Buffer.from('mock-audio')),
    }
  }));

  jest.mock('../services/ContentService', () => ({
    contentService: {
      getAllCharacters: jest.fn().mockResolvedValue([{ id: 'char_001', name: 'Tom Nook', species: 'Tanuki' }]),
      getAllTopics: jest.fn().mockResolvedValue([{ id: 'topic_001', difficulty: 'beginner' }]),
      getContent: jest.fn().mockResolvedValue({ id: 'content_001', title: 'Variables' }),
      searchContent: jest.fn().mockResolvedValue([{ id: 'content_001', title: 'Variables' }]),
    }
  }));

  jest.mock('../services/ImageService', () => ({
    imageService: {
      getImage: jest.fn().mockResolvedValue({ buffer: Buffer.from('mock-image'), mimeType: 'image/jpeg' }),
      getMetadata: jest.fn().mockResolvedValue({ id: 'img_001', mimeType: 'image/jpeg', size: 1024 }),
    }
  }));

  beforeAll(() => {
    app = createServer();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
    });
  });

  describe('GET /api/characters', () => {
    it('should return all characters', async () => {
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should have required character fields', async () => {
      const response = await request(app).get('/api/characters');

      response.body.data.forEach((character: any) => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('species');
      });
    });
  });

  describe('GET /api/topics', () => {
    it('should return all topics', async () => {
      const response = await request(app)
        .get('/api/topics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support difficulty filter', async () => {
      const response = await request(app)
        .get('/api/topics?difficulty=beginner')
        .expect(200);

      response.body.data.forEach((topic: any) => {
        expect(topic.difficulty).toBe('beginner');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/topics?limit=2&offset=0')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.metadata.limit).toBe(2);
      expect(response.body.metadata.offset).toBe(0);
    });
  });

  describe('GET /api/content/:character/:topic', () => {
    it('should return content for valid character and topic', async () => {
      const response = await request(app)
        .get('/api/content/Tom%20Nook/variables')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 404 for invalid character', async () => {
      const response = await request(app)
        .get('/api/content/InvalidChar/variables')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for invalid topic', async () => {
      const response = await request(app)
        .get('/api/content/Tom%20Nook/invalid-topic')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/search', () => {
    it('should search content', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: '변수' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 when query is missing', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tts', () => {
    it('should generate TTS successfully', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: '변수란 무엇일까요?',
          character: 'Tom Nook'
        })
        .expect(200);

      expect(response.type).toBe('audio/wav');
      expect(response.header['content-length']).toBeDefined();
      expect(response.body).toBeInstanceOf(Buffer);
    });

    it('should return 400 when text is missing', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          character: 'Tom Nook'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when character is missing', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: '테스트'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should enforce rate limiting', async () => {
      // 속도 제한 테스트: 분당 10개 제한
      let lastResponse: any = null;

      for (let i = 0; i < 11; i++) {
        lastResponse = await request(app)
          .post('/api/tts')
          .send({
            text: `test ${i}`,
            character: 'Tom Nook'
          });
      }

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('GET /api/images/:imageId', () => {
    it('should return image for valid ID', async () => {
      const response = await request(app)
        .get('/api/images/img_variables_001')
        .expect(200);

      expect(response.type).toMatch(/image/);
      expect(response.body).toBeDefined();
    });

    it('should set cache headers', async () => {
      const response = await request(app)
        .get('/api/images/img_variables_001')
        .expect(200);

      expect(response.get('Cache-Control')).toContain('max-age');
      expect(response.get('ETag')).toBeDefined();
    });
  });

  describe('GET /api/images/:imageId/metadata', () => {
    it('should return image metadata', async () => {
      const response = await request(app)
        .get('/api/images/img_variables_001/metadata')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('mimeType');
      expect(response.body.data).toHaveProperty('size');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('CORS', () => {
    it('should set CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.get('Access-Control-Allow-Origin')).toBeDefined();
    });
  });
});
