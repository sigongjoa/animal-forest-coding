# 🛠️ Development Guide
## Animal Forest Coding - 개발 환경 설정 및 구현 가이드

**Version**: 1.0
**Last Updated**: 2024-11-30
**Status**: Ready for Implementation

---

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [백엔드 구현](#백엔드-구현)
3. [프론트엔드 구현](#프론트엔드-구현)
4. [애플리케이션 실행](#애플리케이션-실행)
5. [API 테스트](#api-테스트)
6. [테스트 작성](#테스트-작성)
7. [배포](#배포)
8. [문제 해결](#문제-해결)

---

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 16.x 이상
- **npm**: 7.x 이상
- **Git**: 최신 버전
- **OS**: Windows / macOS / Linux

### 설치 및 초기화

```bash
# 1. 저장소 클론
git clone <repository-url>
cd animal-forest-coding

# 2. 백엔드 설정
cd backend
npm install

# 3. 프론트엔드 설정 (새 터미널)
cd frontend
npm install

# 4. 환경 변수 설정
# backend/.env 파일 생성
PORT=5000
NODE_ENV=development
TTS_API_KEY=your_api_key_here

# frontend/.env 파일 생성
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 디렉토리 구조 확인

```
animal-forest-coding/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── ContentService.ts
│   │   │   ├── ImageService.ts
│   │   │   └── AnimalesesTTSService.ts
│   │   ├── routes/
│   │   │   └── api.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── server.ts
│   │   └── index.ts
│   ├── data/
│   │   ├── content/
│   │   ├── images/
│   │   └── characters.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── docs/
└── README.md
```

---

## 백엔드 구현

### 1. 프로젝트 초기화

```bash
cd backend

# package.json 생성
npm init -y

# 필수 패키지 설치
npm install express cors dotenv multer
npm install --save-dev typescript ts-node @types/node @types/express jest ts-jest @types/jest
```

### 2. TypeScript 설정

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. 핵심 서비스 구현

#### ContentService.ts

```typescript
// backend/src/services/ContentService.ts
import fs from 'fs';
import path from 'path';

interface Content {
  id: string;
  character: string;
  topic: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentCount: number;
}

interface Character {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
  specialties: string[];
}

export class ContentService {
  private dataPath = path.join(__dirname, '../data');

  getContent(character: string, topic: string): Content | null {
    const validCharacters = this.getAllCharacters();
    if (!validCharacters.find(c => c.name === character)) {
      throw new Error(`Character not found: ${character}`);
    }

    const validTopics = this.getAllTopics();
    if (!validTopics.find(t => t.slug === topic)) {
      throw new Error(`Topic not found: ${topic}`);
    }

    const contentPath = path.join(
      this.dataPath,
      'content',
      `${character.replace(/\s+/g, '-').toLowerCase()}-${topic}.json`
    );

    try {
      const data = fs.readFileSync(contentPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  getAllCharacters(): Character[] {
    const characterPath = path.join(this.dataPath, 'characters.json');
    const data = fs.readFileSync(characterPath, 'utf-8');
    return JSON.parse(data);
  }

  getAllTopics(difficulty?: string): Topic[] {
    const topicsPath = path.join(this.dataPath, 'topics.json');
    const data = fs.readFileSync(topicsPath, 'utf-8');
    let topics: Topic[] = JSON.parse(data);

    if (difficulty) {
      topics = topics.filter(t => t.difficulty === difficulty);
    }

    return topics;
  }

  searchContent(keyword: string): Content[] {
    const results: Content[] = [];
    const contentDir = path.join(this.dataPath, 'content');

    const files = fs.readdirSync(contentDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const content = JSON.parse(
        fs.readFileSync(path.join(contentDir, file), 'utf-8')
      );

      if (
        content.title.toLowerCase().includes(keyword.toLowerCase()) ||
        content.text.toLowerCase().includes(keyword.toLowerCase())
      ) {
        results.push(content);
      }
    }

    return results;
  }
}
```

#### ImageService.ts

```typescript
// backend/src/services/ImageService.ts
import fs from 'fs';
import path from 'path';

interface ImageMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

export class ImageService {
  private imagePath = path.join(__dirname, '../data/images');

  getImage(imageId: string): Buffer {
    // 경로 traversal 공격 방지
    const safeImagePath = path.join(this.imagePath, imageId);
    if (!safeImagePath.startsWith(this.imagePath)) {
      throw new Error('Invalid image path');
    }

    // 파일 검색 (확장자 무시)
    const files = fs.readdirSync(this.imagePath);
    const file = files.find(f => f.startsWith(imageId));

    if (!file) {
      throw new Error(`Image not found: ${imageId}`);
    }

    return fs.readFileSync(path.join(this.imagePath, file));
  }

  getImageMetadata(imageId: string): ImageMetadata {
    // 메타데이터 JSON 파일에서 조회
    const metadataPath = path.join(
      this.imagePath,
      `${imageId}.json`
    );

    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Image metadata not found: ${imageId}`);
    }

    const data = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(data);
  }

  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
```

#### AnimalesesTTSService.ts

```typescript
// backend/src/services/AnimalesesTTSService.ts
import crypto from 'crypto';

interface TTSOptions {
  character: string;
  text: string;
}

export class AnimalesesTTSService {
  private cache = new Map<string, Buffer>();
  private maxCacheSize = 100;
  private validCharacters = [
    'Tom Nook',
    'Isabelle',
    'Timmy',
    'Tommy',
    'Blathers',
    'Celeste'
  ];

  async generateTTS(text: string, character: string): Promise<Buffer> {
    // 입력 검증
    this.validateInput(text, character);

    // 캐시 확인
    const cacheKey = this.getCacheKey(text, character);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // TTS 생성 (예제: 모의 구현)
    const audio = await this.generateAnimalese(text, character);

    // 캐시 저장
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

    if (!this.validCharacters.includes(character)) {
      throw new Error(`Invalid character: ${character}`);
    }
  }

  private async generateAnimalese(text: string, character: string): Promise<Buffer> {
    // 향후: 실제 TTS API 호출
    // 현재: 모의 구현 (개발/테스트용)

    return new Promise((resolve) => {
      // 모의 오디오 생성 (정상 오류 처리용 유효한 MP3 헤더)
      const mockAudio = Buffer.from([
        0xFF, 0xFB, // MP3 동기 워드
        ...new Array(1024).fill(0) // 더미 데이터
      ]);

      resolve(mockAudio);
    });
  }

  private getCacheKey(text: string, character: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${character}:${text}`)
      .digest('hex');
    return hash;
  }

  private cacheAudio(key: string, audio: Buffer): void {
    if (this.cache.size >= this.maxCacheSize) {
      // 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, audio);
  }

  getCachedAudio(text: string, character: string): Buffer | null {
    const cacheKey = this.getCacheKey(text, character);
    return this.cache.get(cacheKey) || null;
  }
}
```

### 4. 미들웨어 구현

#### errorHandler.ts

```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || '요청을 처리할 수 없습니다';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode
    }
  });
};
```

#### rateLimiter.ts

```typescript
// backend/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // 주기적으로 오래된 항목 정리
    setInterval(() => this.cleanup(), this.windowMs);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();

      if (!this.store[key]) {
        this.store[key] = { count: 1, resetTime: now + this.windowMs };
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - 1);
        return next();
      }

      const record = this.store[key];

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + this.windowMs;
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - 1);
        return next();
      }

      record.count++;

      if (record.count > this.maxRequests) {
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));

        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '너무 많은 요청이 발생했습니다',
            statusCode: 429
          }
        });
      }

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - record.count);

      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}
```

### 5. API 라우트 구현

#### api.ts

```typescript
// backend/src/routes/api.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ContentService } from '../services/ContentService';
import { ImageService } from '../services/ImageService';
import { AnimalesesTTSService } from '../services/AnimalesesTTSService';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
const contentService = new ContentService();
const imageService = new ImageService();
const ttsService = new AnimalesesTTSService();

// 캐릭터 조회
router.get('/characters', (req: Request, res: Response, next: NextFunction) => {
  try {
    const characters = contentService.getAllCharacters();
    res.json({
      success: true,
      data: characters
    });
  } catch (error) {
    next(error);
  }
});

// 콘텐츠 조회
router.get('/content/:character/:topic', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { character, topic } = req.params;
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
      data: content
    });
  } catch (error) {
    next(error);
  }
});

// 주제 조회
router.get('/topics', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty, limit = 20, offset = 0 } = req.query;
    const topics = contentService.getAllTopics(difficulty as string);

    res.json({
      success: true,
      data: topics.slice(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string)
      ),
      metadata: {
        count: topics.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    next(error);
  }
});

// 이미지 조회
router.get('/images/:imageId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;
    const image = imageService.getImage(imageId);
    const metadata = imageService.getImageMetadata(imageId);

    res.set('Content-Type', metadata.mimeType);
    res.set('Cache-Control', 'public, max-age=604800');
    res.send(image);
  } catch (error) {
    next(error);
  }
});

// TTS 생성
router.post('/tts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, character } = req.body;

    if (!text || !character) {
      const error: ApiError = new Error('Missing required fields');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const audio = await ttsService.generateTTS(text, character);

    res.json({
      success: true,
      data: {
        audioUrl: `/audio/tts/${Date.now()}.mp3`,
        duration: 10.5,
        mimeType: 'audio/mpeg'
      }
    });
  } catch (error) {
    next(error);
  }
});

// 헬스 체크
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

### 6. 메인 서버 파일

```typescript
// backend/src/server.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { RateLimiter } from './middleware/rateLimiter';

dotenv.config();

export function createServer(): Express {
  const app = express();

  // 미들웨어
  app.use(express.json());
  app.use(cors());

  // 속도 제한 (TTS: 분당 10개, 일반: 분당 100개)
  const ttsLimiter = new RateLimiter(60000, 10);
  const generalLimiter = new RateLimiter(60000, 100);

  app.use('/api/tts', ttsLimiter.middleware());
  app.use('/api', generalLimiter.middleware());

  // 라우트
  app.use('/api', apiRoutes);

  // 정적 파일
  app.use('/images', express.static('data/images'));
  app.use('/audio', express.static('data/audio'));

  // 404 처리
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '요청한 리소스를 찾을 수 없습니다',
        statusCode: 404
      }
    });
  });

  // 에러 핸들러
  app.use(errorHandler);

  return app;
}

// 서버 실행
if (require.main === module) {
  const app = createServer();
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
```

### 7. 데이터 파일 생성

```json
// backend/data/characters.json
[
  {
    "id": "char_tom_nook",
    "name": "Tom Nook",
    "species": "Raccoon",
    "imageUrl": "/images/characters/tom-nook.png",
    "voiceProfile": "business-formal",
    "specialties": ["variables", "functions", "data-structures"]
  },
  {
    "id": "char_isabelle",
    "name": "Isabelle",
    "species": "Shih Tzu",
    "imageUrl": "/images/characters/isabelle.png",
    "voiceProfile": "friendly-cheerful",
    "specialties": ["control-flow", "loops", "conditionals"]
  }
]
```

```json
// backend/data/topics.json
[
  {
    "id": "topic_variables",
    "name": "변수와 데이터 타입",
    "slug": "variables",
    "difficulty": "beginner",
    "estimatedTime": 30,
    "contentCount": 5,
    "order": 1
  },
  {
    "id": "topic_functions",
    "name": "함수와 스코프",
    "slug": "functions",
    "difficulty": "beginner",
    "estimatedTime": 35,
    "contentCount": 6,
    "order": 2
  }
]
```

---

## 프론트엔드 구현

### 1. React 프로젝트 초기화

```bash
cd frontend

# Create React App with TypeScript
npx create-react-app . --template typescript

# 추가 패키지 설치
npm install axios tailwindcss
npm install --save-dev @tailwindcss/config
```

### 2. 핵심 컴포넌트 구현

#### CharacterSelector.tsx

```typescript
// frontend/src/components/CharacterSelector.tsx
import React from 'react';
import './CharacterSelector.css';

interface Character {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
}

interface Props {
  characters: Character[];
  selectedCharacter?: string;
  onSelect: (character: string) => void;
}

export const CharacterSelector: React.FC<Props> = ({
  characters,
  selectedCharacter,
  onSelect
}) => {
  return (
    <div className="character-selector">
      <h2>캐릭터를 선택하세요</h2>
      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-card ${
              selectedCharacter === character.name ? 'selected' : ''
            }`}
            onClick={() => onSelect(character.name)}
          >
            <img src={character.imageUrl} alt={character.name} />
            <h3>{character.name}</h3>
            <p>{character.species}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### ContentDisplay.tsx

```typescript
// frontend/src/components/ContentDisplay.tsx
import React from 'react';
import { AudioPlayer } from './AudioPlayer';
import './ContentDisplay.css';

interface Content {
  id: string;
  character: string;
  title: string;
  text: string;
  imageUrl: string;
  difficulty: string;
  estimatedTime: number;
}

interface Props {
  content: Content;
  audioUrl: string;
  onAudioPlay: () => void;
}

export const ContentDisplay: React.FC<Props> = ({
  content,
  audioUrl,
  onAudioPlay
}) => {
  return (
    <div className="content-display">
      <div className="content-header">
        <h1>{content.title}</h1>
        <div className="content-meta">
          <span className={`difficulty ${content.difficulty}`}>
            {content.difficulty}
          </span>
          <span className="time">⏱️ {content.estimatedTime}분</span>
        </div>
      </div>

      <div className="content-body">
        <div className="content-image">
          <img src={content.imageUrl} alt={content.title} />
        </div>

        <div className="content-text">
          <p>{content.text}</p>

          <AudioPlayer
            audioUrl={audioUrl}
            character={content.character}
            onPlayEnd={onAudioPlay}
          />
        </div>
      </div>
    </div>
  );
};
```

#### AudioPlayer.tsx

```typescript
// frontend/src/components/AudioPlayer.tsx
import React, { useRef, useState } from 'react';
import './AudioPlayer.css';

interface Props {
  audioUrl: string;
  character: string;
  autoPlay?: boolean;
  onPlayEnd?: () => void;
}

export const AudioPlayer: React.FC<Props> = ({
  audioUrl,
  character,
  autoPlay = false,
  onPlayEnd
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onPlayEnd?.();
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="player-controls">
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
        >
          {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
        </button>

        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>

        <span className="character-name">🎙️ {character}의 목소리</span>
      </div>
    </div>
  );
};
```

### 3. 커스텀 훅 구현

#### useContent.ts

```typescript
// frontend/src/hooks/useContent.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface Content {
  id: string;
  character: string;
  topic: string;
  title: string;
  text: string;
  imageUrl: string;
  difficulty: string;
  estimatedTime: number;
}

export const useContent = (character: string, topic: string) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/content/${encodeURIComponent(character)}/${topic}`
        );

        if (response.data.success) {
          setContent(response.data.data);
        } else {
          throw new Error(response.data.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (character && topic) {
      loadContent();
    }
  }, [character, topic]);

  return { content, loading, error };
};
```

#### useAudio.ts

```typescript
// frontend/src/hooks/useAudio.ts
import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export const useAudio = (text: string, character: string) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateAudio = useCallback(async () => {
    if (!text || !character) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/tts', {
        text,
        character
      });

      if (response.data.success) {
        setAudioUrl(response.data.data.audioUrl);
      } else {
        throw new Error(response.data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [text, character]);

  return { audioUrl, loading, error, generateAudio };
};
```

### 4. API 클라이언트 서비스

```typescript
// frontend/src/services/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('API rate limit exceeded');
    }
    return Promise.reject(error);
  }
);
```

### 5. 메인 App 컴포넌트

```typescript
// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { CharacterSelector } from './components/CharacterSelector';
import { ContentDisplay } from './components/ContentDisplay';
import { useContent } from './hooks/useContent';
import { useAudio } from './hooks/useAudio';
import { apiClient } from './services/apiClient';
import './App.css';

interface Character {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('variables');
  const [charactersLoading, setCharactersLoading] = useState(true);

  const { content, loading: contentLoading } = useContent(
    selectedCharacter,
    selectedTopic
  );
  const { audioUrl, loading: audioLoading, generateAudio } = useAudio(
    content?.text || '',
    selectedCharacter
  );

  // 캐릭터 목록 로드
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const response = await apiClient.get('/characters');
        if (response.data.success) {
          setCharacters(response.data.data);
          setSelectedCharacter(response.data.data[0]?.name || '');
        }
      } catch (error) {
        console.error('Failed to load characters:', error);
      } finally {
        setCharactersLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // 콘텐츠 로드 후 음성 생성
  useEffect(() => {
    if (content && !audioUrl && !audioLoading) {
      generateAudio();
    }
  }, [content, audioUrl, audioLoading, generateAudio]);

  if (charactersLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🦁 동물 숲 코딩 학습 플랫폼</h1>
      </header>

      <main className="app-main">
        <CharacterSelector
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelect={setSelectedCharacter}
        />

        {contentLoading || audioLoading ? (
          <div className="loading">콘텐츠 로딩 중...</div>
        ) : content ? (
          <ContentDisplay
            content={content}
            audioUrl={audioUrl}
            onAudioPlay={() => {}}
          />
        ) : (
          <div className="error">콘텐츠를 로드할 수 없습니다</div>
        )}
      </main>
    </div>
  );
}

export default App;
```

---

## 애플리케이션 실행

### 개발 모드

```bash
# 터미널 1: 백엔드 실행
cd backend
npm run dev

# 터미널 2: 프론트엔드 실행
cd frontend
npm start
```

### 빌드

```bash
# 백엔드 빌드
cd backend
npm run build

# 프론트엔드 빌드
cd frontend
npm run build
```

### 프로덕션 실행

```bash
# 백엔드
NODE_ENV=production node backend/dist/server.js

# 프론트엔드는 빌드된 정적 파일을 웹 서버에서 제공
```

---

## API 테스트

### cURL 테스트

```bash
# 캐릭터 조회
curl http://localhost:5000/api/characters

# 콘텐츠 조회
curl http://localhost:5000/api/content/Tom%20Nook/variables

# TTS 생성
curl -X POST http://localhost:5000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"변수란 무엇일까요?","character":"Tom Nook"}'
```

### Postman 테스트

1. Postman 설치
2. `New → HTTP Request` 생성
3. 엔드포인트 입력 및 테스트

---

## 테스트 작성

```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test

# 커버리지 리포트
npm test -- --coverage
```

---

## 배포

### Docker를 사용한 배포

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

```bash
# 이미지 빌드 및 실행
docker build -t animal-forest-backend .
docker run -p 5000:5000 animal-forest-backend
```

---

## 문제 해결

### 포트 이미 사용 중

```bash
# 기존 프로세스 종료 (macOS/Linux)
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### 모듈 찾을 수 없음

```bash
# 의존성 재설치
rm -rf node_modules
npm install
```

### CORS 에러

backend/.env에서 허용된 도메인 확인

---

**다음 단계**: [API.md](API.md) - API 명세 참고
**관련 문서**: [SDD.md](SDD.md) - 시스템 설계, [TDD.md](TDD.md) - 테스트 전략
