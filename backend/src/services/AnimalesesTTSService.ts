import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class AnimalesesTTSService {
  private cache = new Map<string, Buffer>();
  private maxCacheSize = 100;
  private validCharacterIds = ['char_tom_nook', 'char_isabelle', 'char_timmy', 'char_tommy', 'char_blathers', 'char_celeste', 'nook', 'player'];
  private validCharacterNames = ['Tom Nook', 'Isabelle', 'Timmy', 'Tommy', 'Blathers', 'Celeste', 'Nook', 'Player'];
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
    return new Promise((resolve) => {
      const sampleRate = 44100;
      const channels = 1;
      const bitsPerSample = 16;

      // Voice Profiles (Pitch scalar)
      let pitchFactor = 1.0;
      let speed = 0.08; // Seconds per char

      const charId = character.toLowerCase();
      if (charId.includes('nook')) {
        pitchFactor = 0.6; // Deep voice
        speed = 0.095;
      } else if (charId.includes('isabelle')) {
        pitchFactor = 1.6; // High voice
        speed = 0.07;
      } else if (charId === 'player') {
        pitchFactor = 1.0;
      } else if (charId.includes('timmy') || charId.includes('tommy')) {
        pitchFactor = 1.8;
        speed = 0.06;
      }

      // Vowel Formants (Approximate F1, F2 frequencies in Hz)
      const vowels = [
        { name: 'a', f1: 730, f2: 1090 }, // /a/
        { name: 'e', f1: 530, f2: 1840 }, // /e/
        { name: 'i', f1: 270, f2: 2290 }, // /i/
        { name: 'o', f1: 570, f2: 840 },  // /o/
        { name: 'u', f1: 300, f2: 870 },  // /u/
      ];

      // Remove spaces/special chars for density
      const speechText = text.replace(/[^a-zA-Z0-9가-힣]/g, '');
      const numChars = speechText.length || 1;

      const totalDuration = numChars * speed;
      const numSamples = Math.floor(sampleRate * totalDuration);
      const audioData = new Float32Array(numSamples);

      let currentSampleIndex = 0;

      for (let i = 0; i < numChars; i++) {
        const char = speechText[i];

        // Deterministically pick a vowel based on character code
        const charCode = char.charCodeAt(0);
        const vowel = vowels[charCode % vowels.length];

        // Randomize pitch slightly
        const pitchMod = 1.0 + ((charCode % 10) - 5) / 50.0; // +/- 10%

        const effectiveF1 = vowel.f1 * pitchFactor * pitchMod;
        const effectiveF2 = vowel.f2 * pitchFactor * pitchMod;

        const charDuration = Math.floor(sampleRate * speed);

        for (let j = 0; j < charDuration; j++) {
          if (currentSampleIndex >= numSamples) break;

          const t = j / sampleRate;

          // Envelope: Fast attack, Sustain, Fast decay
          let envelope = 1;
          if (j < charDuration * 0.2) envelope = j / (charDuration * 0.2);
          else if (j > charDuration * 0.8) envelope = (charDuration - j) / (charDuration * 0.2);

          // Formant Synthesis
          const val1 = Math.sin(2 * Math.PI * effectiveF1 * t);
          const val2 = Math.sin(2 * Math.PI * effectiveF2 * t) * 0.5;

          // Buzz for texture
          const fundamental = 150 * pitchFactor * pitchMod;
          const buzz = (Math.sin(2 * Math.PI * fundamental * t) > 0 ? 0.3 : -0.3) * 0.2;

          audioData[currentSampleIndex++] = (val1 + val2 + buzz) * envelope * 0.3;
        }
      }

      // Silence padding
      while (currentSampleIndex < numSamples) {
        audioData[currentSampleIndex++] = 0;
      }

      // Convert to Int16 PCM
      const pcmData = new Int16Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }

      // Build WAV Header
      const header = Buffer.alloc(44);
      let offset = 0;

      header.write('RIFF', offset); offset += 4;
      header.writeUInt32LE(36 + numSamples * 2, offset); offset += 4;
      header.write('WAVE', offset); offset += 4;
      header.write('fmt ', offset); offset += 4;
      header.writeUInt32LE(16, offset); offset += 4;
      header.writeUInt16LE(1, offset); offset += 2;
      header.writeUInt16LE(channels, offset); offset += 2;
      header.writeUInt32LE(sampleRate, offset); offset += 4;
      header.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, offset); offset += 4;
      header.writeUInt16LE(channels * bitsPerSample / 8, offset); offset += 2;
      header.writeUInt16LE(bitsPerSample, offset); offset += 2;
      header.write('data', offset); offset += 4;
      header.writeUInt32LE(numSamples * 2, offset);

      const pcmBuffer = Buffer.from(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
      const wavBuffer = Buffer.concat([header, pcmBuffer]);

      setTimeout(() => {
        resolve(wavBuffer);
      }, 10);
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
