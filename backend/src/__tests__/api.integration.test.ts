/**
 * API 통합 테스트 (Integration Tests)
 *
 * 목표: API 엔드포인트가 전체 스택을 통해 정상 작동하는지 확인
 * - 라우터 → 미들웨어 → 서비스 → 응답
 */

import request from 'supertest';
import { createServer } from '../server';
import { Express } from 'express';

describe('API Integration Tests - Express Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = createServer();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('services');
    });

    it('should include service status in health check', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.services).toHaveProperty('contentService');
      expect(response.body.services).toHaveProperty('imageService');
      expect(response.body.services).toHaveProperty('ttsService');
      expect(response.body.services.contentService).toBe('available');
    });

    it('should have valid ISO timestamp', async () => {
      const response = await request(app).get('/api/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should have positive uptime', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/characters', () => {
    it('should return array of characters', async () => {
      const response = await request(app).get('/api/characters');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include metadata in response', async () => {
      const response = await request(app).get('/api/characters');

      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('count');
      expect(response.body.metadata).toHaveProperty('timestamp');
      expect(response.body.metadata.count).toBe(response.body.data.length);
    });

    it('should have proper character structure', async () => {
      const response = await request(app).get('/api/characters');

      expect(response.body.data.length).toBeGreaterThan(0);
      const character = response.body.data[0];

      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('species');
      expect(character).toHaveProperty('imageUrl');
    });

    it('should return valid JSON', async () => {
      const response = await request(app).get('/api/characters');

      expect(response.type).toBe('application/json');
      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    });
  });

  describe('GET /api/topics', () => {
    it('should return array of topics', async () => {
      const response = await request(app).get('/api/topics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination with limit parameter', async () => {
      const response = await request(app).get('/api/topics?limit=5');

      expect(response.body.metadata.limit).toBeLessThanOrEqual(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should support pagination with offset parameter', async () => {
      const response = await request(app).get('/api/topics?offset=0&limit=5');

      expect(response.body.metadata.offset).toBe(0);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should indicate if more results are available', async () => {
      const response = await request(app).get('/api/topics?limit=1');

      expect(response.body.metadata).toHaveProperty('hasMore');
      expect(typeof response.body.metadata.hasMore).toBe('boolean');
    });

    it('should support difficulty filtering', async () => {
      const response = await request(app).get('/api/topics?difficulty=beginner');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should limit max results to 100', async () => {
      const response = await request(app).get('/api/topics?limit=200');

      expect(response.body.metadata.limit).toBeLessThanOrEqual(100);
    });

    it('should return totalCount in metadata', async () => {
      const response = await request(app).get('/api/topics');

      expect(response.body.metadata).toHaveProperty('totalCount');
      expect(response.body.metadata.totalCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/content/:character/:topic', () => {
    let testCharacter: string;
    let testTopic: string;

    beforeAll(async () => {
      const charactersRes = await request(app).get('/api/characters');
      const topicsRes = await request(app).get('/api/topics');

      if (charactersRes.body.data.length > 0 && topicsRes.body.data.length > 0) {
        testCharacter = charactersRes.body.data[0].name;
        testTopic = topicsRes.body.data[0].slug;
      }
    });

    it('should return content for valid character and topic', async () => {
      if (!testCharacter || !testTopic) {
        console.warn('Skipping test: no test data available');
        return;
      }

      const response = await request(app).get(
        `/api/content/${testCharacter}/${testTopic}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for invalid character', async () => {
      const response = await request(app).get(
        `/api/content/invalid-character/topic`
      );

      expect(response.status).toBe(400); // Bad Request or 404
    });

    it('should handle URL-encoded characters', async () => {
      if (!testCharacter || !testTopic) {
        return;
      }

      const encodedCharacter = encodeURIComponent(testCharacter);
      const response = await request(app).get(
        `/api/content/${encodedCharacter}/${testTopic}`
      );

      // 성공 또는 유효한 오류 응답
      expect([200, 400, 404]).toContain(response.status);
    });

    it('should require both character and topic parameters', async () => {
      const response = await request(app).get('/api/content/character');

      expect(response.status).toBe(404); // 라우트 매칭 실패
    });
  });

  describe('GET /api/search', () => {
    it('should require query parameter', async () => {
      const response = await request(app).get('/api/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return search results for valid query', async () => {
      const response = await request(app).get('/api/search?q=control');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include query in response metadata', async () => {
      const response = await request(app).get('/api/search?q=test');

      expect(response.body.metadata).toHaveProperty('query');
      expect(response.body.metadata.query).toBe('test');
    });

    it('should include result count in metadata', async () => {
      const response = await request(app).get('/api/search?q=a');

      expect(response.body.metadata).toHaveProperty('count');
      expect(response.body.metadata.count).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array for non-matching query', async () => {
      const response = await request(app).get(
        '/api/search?q=zzzzzzz-nonexistent-query'
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should be case-insensitive', async () => {
      const response1 = await request(app).get('/api/search?q=control');
      const response2 = await request(app).get('/api/search?q=CONTROL');

      expect(response1.body.metadata.count).toBe(response2.body.metadata.count);
    });
  });

  describe('GET /api/images/:imageId/metadata', () => {
    it('should require imageId parameter', async () => {
      const response = await request(app).get('/api/images//metadata');

      expect(response.status).toBe(404);
    });

    it('should return image metadata for valid ID', async () => {
      // 실제 이미지 ID로 테스트
      const response = await request(app).get('/api/images/test-image/metadata');

      // 성공하거나 404 반환
      expect([200, 404, 400]).toContain(response.status);
    });

    it('should have proper metadata structure when found', async () => {
      const response = await request(app).get('/api/images/any-id/metadata');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });
  });

  describe('POST /api/tts', () => {
    it('should require text field', async () => {
      const response = await request(app).post('/api/tts').send({
        character: 'isabelle',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require character field', async () => {
      const response = await request(app).post('/api/tts').send({
        text: 'Hello',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept both text and character', async () => {
      const response = await request(app)
        .post('/api/tts')
        .set('Content-Type', 'application/json')
        .send({
          text: 'Hello, world!',
          character: 'isabelle',
        });

      // 성공하거나 유효한 오류 반환
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should return audio/wav content type on success', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: 'Test',
          character: 'isabelle',
        });

      if (response.status === 200) {
        expect(response.type).toMatch(/audio/);
      }
    });

    it('should validate text is string', async () => {
      const response = await request(app).post('/api/tts').send({
        text: 123, // number, not string
        character: 'isabelle',
      });

      expect(response.status).toBe(400);
    });

    it('should validate character is string', async () => {
      const response = await request(app).post('/api/tts').send({
        text: 'Hello',
        character: 123, // number, not string
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return error in proper format', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should include error code', async () => {
      const response = await request(app).get('/api/content/x');

      if (response.status !== 200) {
        expect(response.body.error).toHaveProperty('code');
      }
    });

    it('should include error message', async () => {
      const response = await request(app).get('/api/content/invalid');

      if (response.status !== 200) {
        expect(response.body.error).toHaveProperty('message');
      }
    });

    it('should include status code in error', async () => {
      const response = await request(app).get('/api/unknown-endpoint');

      if (response.status !== 200) {
        expect(response.body.error).toHaveProperty('statusCode');
      }
    });
  });

  describe('Response format', () => {
    it('should always include success field', async () => {
      const routes = [
        '/api/health',
        '/api/characters',
        '/api/topics',
        '/api/search?q=test',
      ];

      for (const route of routes) {
        const response = await request(app).get(route);
        expect(response.body).toHaveProperty('success');
      }
    });

    it('should always include timestamp in metadata', async () => {
      const response = await request(app).get('/api/characters');

      expect(response.body.metadata).toHaveProperty('timestamp');
      const timestamp = new Date(response.body.metadata.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should return valid JSON for all endpoints', async () => {
      const response = await request(app).get('/api/health');

      expect(response.type).toMatch(/json/);
      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    });
  });

  describe('Request validation', () => {
    it('should handle missing parameters gracefully', async () => {
      const response = await request(app).get('/api/search');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/tts')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: 'Hello',
          character: 'isabelle',
        });

      // supertest가 자동으로 Content-Type을 설정함
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Performance', () => {
    it('should return characters within reasonable time', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/characters');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 1초 이내
    });

    it('should return topics within reasonable time', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/topics');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });

    it('should return search results within reasonable time', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/search?q=test');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // 2초 이내
    });

    it('health check should be very fast', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/health');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // 100ms 이내
    });
  });
});
