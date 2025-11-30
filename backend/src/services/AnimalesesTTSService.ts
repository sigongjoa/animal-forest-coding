import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class AnimalesesTTSService {
  private cache = new Map<string, Buffer>();
  private maxCacheSize = 100;
  private validCharacterIds = ['char_tom_nook', 'char_isabelle', 'char_timmy', 'char_tommy', 'char_blathers', 'char_celeste'];
  private validCharacterNames = ['Tom Nook', 'Isabelle', 'Timmy', 'Tommy', 'Blathers', 'Celeste'];
  private dataPath = path.join(__dirname, '../../data');
  private charactersCache: any[] | null = null;

  async generateTTS(text: string, character: string): Promise<Buffer> {
    this.validateInput(text, character);

    const cacheKey = this.getCacheKey(text, character);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const audio = await this.generateAnimalese(text, character);
    this.cacheAudio(cacheKey, audio);

    return audio;
  }

  private validateInput(text: string, character: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 1000) {
      throw new Error('Text exceeds maximum length (1000 characters)');
    }

    const isValidId = this.validCharacterIds.includes(character);
    const isValidName = this.validCharacterNames.includes(character);
    if (!isValidId && !isValidName) {
      throw new Error(`Invalid character: ${character}`);
    }
  }

  private async generateAnimalese(text: string, character: string): Promise<Buffer> {
    // 유효한 WAV 오디오 생성 (테스트용)
    return new Promise((resolve) => {
      const sampleRate = 44100;
      const duration = 2; // 2초
      const channels = 1;
      const bitsPerSample = 16;

      const numSamples = sampleRate * duration;
      const audioData = new Float32Array(numSamples);

      // 텍스트 길이에 따라 톤 생성
      const frequency = 440 + (text.length % 100) * 5; // 440Hz ~ 940Hz

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // 사인파 생성 + 페이드 아웃
        const envelope = Math.exp(-t * 1); // 1초 후 사라짐
        audioData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }

      // Float32 to PCM 변환
      const pcmData = new Int16Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const sample = audioData[i];
        pcmData[i] = sample < 0
          ? sample * 0x8000
          : sample * 0x7FFF;
      }

      // WAV 헤더 생성
      const header = Buffer.alloc(44);
      let offset = 0;

      // "RIFF" chunk descriptor
      header.write('RIFF', offset);
      offset += 4;
      header.writeUInt32LE(36 + numSamples * 2, offset);
      offset += 4;
      header.write('WAVE', offset);
      offset += 4;

      // "fmt " sub-chunk
      header.write('fmt ', offset);
      offset += 4;
      header.writeUInt32LE(16, offset); // subchunk1 size
      offset += 4;
      header.writeUInt16LE(1, offset); // audio format (PCM)
      offset += 2;
      header.writeUInt16LE(channels, offset); // number of channels
      offset += 2;
      header.writeUInt32LE(sampleRate, offset); // sample rate
      offset += 4;
      header.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, offset); // byte rate
      offset += 4;
      header.writeUInt16LE(channels * bitsPerSample / 8, offset); // block align
      offset += 2;
      header.writeUInt16LE(bitsPerSample, offset); // bits per sample
      offset += 2;

      // "data" sub-chunk
      header.write('data', offset);
      offset += 4;
      header.writeUInt32LE(numSamples * 2, offset); // subchunk2 size

      // PCM 데이터를 Buffer로 변환
      const pcmBuffer = Buffer.from(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);

      // 헤더와 PCM 데이터 합치기
      const wavBuffer = Buffer.concat([header, pcmBuffer]);

      // 비동기 작업 시뮬레이션 (50-200ms 지연)
      const delay = 50 + Math.random() * 150;
      setTimeout(() => {
        resolve(wavBuffer);
      }, delay);
    });
  }

  private getCacheKey(text: string, character: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${character}:${text}`);
    return hash.digest('hex');
  }

  private cacheAudio(key: string, audio: Buffer): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value as string;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, audio);
  }

  getCachedAudio(text: string, character: string): Buffer | null {
    const cacheKey = this.getCacheKey(text, character);
    return this.cache.get(cacheKey) || null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}
