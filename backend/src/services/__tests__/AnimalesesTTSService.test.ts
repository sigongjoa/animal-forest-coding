import { AnimalesesTTSService } from '../AnimalesesTTSService';

describe('AnimalesesTTSService', () => {
  let service: AnimalesesTTSService;

  beforeEach(() => {
    service = new AnimalesesTTSService();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('generateTTS', () => {
    it('should generate audio buffer', async () => {
      const audio = await service.generateTTS('변수란 무엇일까요?', 'Tom Nook');

      expect(Buffer.isBuffer(audio)).toBe(true);
      expect(audio.length).toBeGreaterThan(0);
    });

    it('should throw error for empty text', async () => {
      await expect(
        service.generateTTS('', 'Tom Nook')
      ).rejects.toThrow('Text cannot be empty');
    });

    it('should throw error for invalid character', async () => {
      await expect(
        service.generateTTS('안녕하세요', 'InvalidCharacter')
      ).rejects.toThrow('Invalid character');
    });

    it('should throw error for text exceeding max length', async () => {
      const longText = 'a'.repeat(1001);

      await expect(
        service.generateTTS(longText, 'Tom Nook')
      ).rejects.toThrow('Text exceeds maximum length');
    });

    it('should accept all valid characters', async () => {
      const validCharacters = ['Tom Nook', 'Isabelle', 'Timmy', 'Tommy', 'Blathers', 'Celeste'];

      for (const character of validCharacters) {
        const audio = await service.generateTTS('테스트', character);
        expect(Buffer.isBuffer(audio)).toBe(true);
      }
    });
  });

  describe('caching', () => {
    it('should cache generated audio', async () => {
      const text = '캐시 테스트';
      const character = 'Tom Nook';

      const audio1 = await service.generateTTS(text, character);
      const audio2 = service.getCachedAudio(text, character);

      expect(audio2).toBeDefined();
      expect(audio1).toEqual(audio2);
    });

    it('should return null for uncached audio', () => {
      const audio = service.getCachedAudio('uncached text', 'Tom Nook');
      expect(audio).toBeNull();
    });

    it('should maintain cache size limit', async () => {
      // 캐시 크기 초과 테스트 (최대 100개)
      for (let i = 0; i < 105; i++) {
        await service.generateTTS(`text ${i}`, 'Tom Nook');
      }

      expect(service.getCacheSize()).toBeLessThanOrEqual(100);
    }, 20000);

    it('should clear cache', async () => {
      await service.generateTTS('테스트', 'Tom Nook');
      expect(service.getCacheSize()).toBeGreaterThan(0);

      service.clearCache();
      expect(service.getCacheSize()).toBe(0);
    });
  });

  describe('validation', () => {
    it('should reject whitespace-only text', async () => {
      await expect(
        service.generateTTS('   ', 'Tom Nook')
      ).rejects.toThrow('Text cannot be empty');
    });

    it('should accept text at max length', async () => {
      const text = 'a'.repeat(1000);
      const audio = await service.generateTTS(text, 'Tom Nook');

      expect(Buffer.isBuffer(audio)).toBe(true);
    });
  });
});
