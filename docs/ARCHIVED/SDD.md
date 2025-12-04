# 📐 System Design Document (SDD)
## Animal Forest Coding - 동물 숲 코딩 학습 플랫폼

**Version**: 1.0
**Date**: 2024-11-30
**Status**: Ready for Implementation

---

## 📋 목차

1. [개요](#개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [컴포넌트 설계](#컴포넌트-설계)
4. [데이터 모델](#데이터-모델)
5. [API 명세](#api-명세)
6. [보안 고려사항](#보안-고려사항)
7. [성능 최적화](#성능-최적화)
8. [확장성 계획](#확장성-계획)

---

## 개요

### 목표
Animal Crossing의 캐릭터들이 코딩 개념을 Animalese 음성으로 설명하는 교육용 웹 플랫폼

### 핵심 요구사항
1. 다양한 캐릭터 선택 지원
2. Animalese TTS 음성 생성
3. 코딩 학습 콘텐츠 제공
4. 사용자 진행률 추적 (향후)
5. 반응형 사용자 인터페이스

### 성공 지표
- ✅ 페이지 로드 시간 < 2초
- ✅ 음성 생성 시간 < 1초
- ✅ 가용성 99.5%
- ✅ 사용자 만족도 > 4.5/5

---

## 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 브라우저                           │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   프론트엔드 (React)                         │
│  ┌────────────────┬──────────────┬──────────────┐           │
│  │ CharacterPage  │ ContentView  │ AudioPlayer  │           │
│  └────────────────┴──────────────┴──────────────┘           │
│                    ↓ API Calls                               │
│                 API Client Service                          │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  백엔드 (Express.js)                        │
│  ┌──────────────────────────────────────────────┐          │
│  │           API Routes & Middleware            │          │
│  │  ├─ Auth Middleware                         │          │
│  │  ├─ Error Handler                           │          │
│  │  └─ Rate Limiter                            │          │
│  └──────────────────────────────────────────────┘          │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │           Business Logic Services            │          │
│  │  ├─ ContentService                          │          │
│  │  ├─ ImageService                            │          │
│  │  └─ AnimalesesTTSService                    │          │
│  └──────────────────────────────────────────────┘          │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────┐          │
│  │         Data & External Services             │          │
│  │  ├─ File System / Database                  │          │
│  │  ├─ Image Files                             │          │
│  │  └─ TTS API (External)                      │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 계층별 책임

#### 프레젠테이션 계층 (Frontend)
- 사용자 인터페이스 제공
- 입력 유효성 검사 (클라이언트 사이드)
- 상태 관리
- API 호출 조정

#### 비즈니스 로직 계층 (Backend Services)
- 콘텐츠 관리
- 이미지 처리
- TTS 생성
- 비즈니스 규칙 적용

#### 데이터 계층
- 파일 시스템 (초기)
- 데이터베이스 (향후)
- 캐시 (향후)

---

## 컴포넌트 설계

### 백엔드 컴포넌트

#### 1. ContentService
캐릭터별 학습 콘텐츠 관리

```typescript
class ContentService {
  // 특정 캐릭터와 주제의 콘텐츠 조회
  getContent(character: string, topic: string): Content

  // 모든 주제 목록 조회
  getAllTopics(): Topic[]

  // 모든 캐릭터 조회
  getAllCharacters(): Character[]

  // 콘텐츠 검색
  searchContent(keyword: string): Content[]
}
```

**데이터 구조**:
```typescript
interface Content {
  id: string
  character: string
  topic: string
  title: string
  description: string
  text: string
  imageId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  createdAt: Date
  updatedAt: Date
}
```

#### 2. ImageService
이미지 파일 관리 및 제공

```typescript
class ImageService {
  // 이미지 조회
  getImage(imageId: string): Buffer

  // 이미지 메타데이터 조회
  getImageMetadata(imageId: string): ImageMetadata

  // 이미지 업로드
  uploadImage(file: Express.Multer.File): string

  // 이미지 캐싱 처리
  getImageWithCache(imageId: string): Buffer
}
```

#### 3. AnimalesesTTSService
Animalese 음성 생성 서비스

```typescript
class AnimalesesTTSService {
  // Animalese 음성 생성
  generateTTS(text: string, character: string): Promise<Buffer>

  // 캐시에서 조회
  getCachedAudio(text: string, character: string): Buffer | null

  // 캐시에 저장
  cacheAudio(text: string, character: string, audio: Buffer): void
}
```

**구현 전략**:
1. **외부 API** (기본): Third-party Animalese 생성 API 호출
2. **로컬 생성**: Web-based Animalese 생성 라이브러리 통합
3. **모의 구현**: 개발/테스트용 메모리 TTS

#### 4. API Router
REST API 엔드포인트 관리

```typescript
router.get('/api/characters', getCharacters)
router.get('/api/content/:character/:topic', getContent)
router.get('/api/images/:imageId', getImage)
router.post('/api/tts', generateTTS)
router.get('/api/topics', getTopics)
```

### 프론트엔드 컴포넌트

#### 1. CharacterSelector 컴포넌트
```typescript
interface CharacterSelectorProps {
  characters: Character[]
  onSelect: (character: string) => void
  selectedCharacter?: string
}

function CharacterSelector(props: CharacterSelectorProps) {
  // 캐릭터 그리드 표시
  // 선택 이벤트 처리
}
```

#### 2. ContentDisplay 컴포넌트
```typescript
interface ContentDisplayProps {
  content: Content
  onAudioPlay: () => void
}

function ContentDisplay(props: ContentDisplayProps) {
  // 콘텐츠 텍스트 표시
  // 이미지 표시
  // 메타데이터 표시
}
```

#### 3. AudioPlayer 컴포넌트
```typescript
interface AudioPlayerProps {
  audioUrl: string
  character: string
  autoPlay?: boolean
  onPlayEnd?: () => void
}

function AudioPlayer(props: AudioPlayerProps) {
  // 재생/일시정지 컨트롤
  // 진행률 표시
  // 음량 조절
}
```

#### 4. 커스텀 훅

**useContent Hook**:
```typescript
function useContent(character: string, topic: string) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // API에서 콘텐츠 로드
  }, [character, topic])

  return { content, loading, error }
}
```

**useAudio Hook**:
```typescript
function useAudio(text: string, character: string) {
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generateAudio = useCallback(async () => {
    // TTS 생성 요청
  }, [text, character])

  return { audioUrl, loading, generateAudio }
}
```

---

## 데이터 모델

### Content (학습 콘텐츠)
```json
{
  "id": "content_001",
  "character": "Tom Nook",
  "topic": "variables",
  "title": "변수란 무엇일까요?",
  "description": "Tom Nook과 함께 변수의 개념을 배워봅시다",
  "text": "변수는 값을 저장하는 상자와 같습니다...",
  "imageId": "img_variables_001",
  "difficulty": "beginner",
  "estimatedTime": 5,
  "tags": ["variables", "basics", "javascript"],
  "createdAt": "2024-11-30T10:00:00Z",
  "updatedAt": "2024-11-30T10:00:00Z"
}
```

### Character (캐릭터)
```json
{
  "id": "char_tom_nook",
  "name": "Tom Nook",
  "species": "Raccoon",
  "description": "성공한 사업가 Tom Nook",
  "imageUrl": "/images/characters/tom-nook.png",
  "voiceProfile": "business-formal",
  "specialties": ["variables", "functions", "data-structures"],
  "createdAt": "2024-11-30T10:00:00Z"
}
```

### Image (이미지)
```json
{
  "id": "img_variables_001",
  "filename": "variables-diagram.png",
  "mimeType": "image/png",
  "size": 102400,
  "width": 800,
  "height": 600,
  "altText": "변수 메모리 구조 다이어그램",
  "url": "/images/content/variables-diagram.png",
  "createdAt": "2024-11-30T10:00:00Z"
}
```

### Audio (음성)
```json
{
  "id": "audio_001",
  "character": "Tom Nook",
  "text": "변수는 값을 저장하는 상자와 같습니다",
  "mimeType": "audio/mpeg",
  "size": 51200,
  "duration": 10.5,
  "url": "/audio/tts/tom-nook-variables-001.mp3",
  "cached": true,
  "createdAt": "2024-11-30T10:00:00Z"
}
```

### Topic (주제)
```json
{
  "id": "topic_variables",
  "name": "변수와 데이터 타입",
  "slug": "variables",
  "description": "JavaScript의 변수와 다양한 데이터 타입",
  "difficulty": "beginner",
  "estimatedTime": 30,
  "contentCount": 5,
  "order": 1,
  "createdAt": "2024-11-30T10:00:00Z"
}
```

---

## API 명세

### 기본 URL
```
http://localhost:5000/api
https://api.animalforestcoding.dev/api
```

### 인증
현재 단계에서는 인증 없음. 향후 JWT 토큰 기반 인증 추가

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "요청한 콘텐츠를 찾을 수 없습니다",
    "statusCode": 404
  }
}
```

### 주요 엔드포인트

#### 1. GET /characters
사용 가능한 모든 캐릭터 조회

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "char_tom_nook",
      "name": "Tom Nook",
      "species": "Raccoon",
      "imageUrl": "/images/characters/tom-nook.png"
    }
  ]
}
```

#### 2. GET /content/:character/:topic
특정 캐릭터와 주제의 콘텐츠 조회

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "content_001",
    "character": "Tom Nook",
    "topic": "variables",
    "title": "변수란 무엇일까요?",
    "text": "...",
    "imageId": "img_variables_001",
    "difficulty": "beginner"
  }
}
```

#### 3. GET /images/:imageId
이미지 조회 및 다운로드

**응답**: 바이너리 이미지 데이터

#### 4. POST /tts
Animalese 음성 생성

**요청**:
```json
{
  "text": "변수는 값을 저장하는 상자와 같습니다",
  "character": "Tom Nook"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "audioUrl": "/audio/tts/tom-nook-001.mp3",
    "duration": 10.5,
    "mimeType": "audio/mpeg"
  }
}
```

#### 5. GET /topics
모든 주제 조회

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "topic_variables",
      "name": "변수와 데이터 타입",
      "difficulty": "beginner",
      "contentCount": 5
    }
  ]
}
```

---

## 보안 고려사항

### 1. 입력 검증
모든 API 입력값 검증:
```typescript
// 예: 캐릭터 이름 검증
const validCharacters = ['Tom Nook', 'Isabelle', 'Timmy', 'Tommy']
if (!validCharacters.includes(character)) {
  throw new ValidationError('Invalid character')
}
```

### 2. Rate Limiting
API 남용 방지 (초당 요청 제한):
```typescript
const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 10,              // 최대 10개 요청
  message: '너무 많은 요청이 발생했습니다'
})
```

### 3. CORS 설정
```typescript
const corsOptions = {
  origin: ['http://localhost:3000', 'https://animalforestcoding.dev'],
  credentials: true,
  optionsSuccessStatus: 200
}
```

### 4. 에러 메시지 필터링
내부 정보 노출 방지:
```typescript
// 나쁜 예
throw new Error(`Database error: ${error.message}`)

// 좋은 예
throw new Error('요청을 처리할 수 없습니다')
```

### 5. 파일 경로 Sanitization
```typescript
import path from 'path'
const safeImagePath = path.join(imageDir, imageId)
if (!safeImagePath.startsWith(imageDir)) {
  throw new Error('Invalid path')
}
```

---

## 성능 최적화

### 1. 캐싱 전략

**백엔드 캐시** (메모리):
- TTS 음성: LRU 캐시, 최대 100개 항목
- 콘텐츠: 24시간 만료
- 이미지 메타데이터: 1시간 만료

**클라이언트 캐시**:
- 정적 자산: 1년 만료
- API 응답: 5분 만료
- 이미지: 7일 만료

### 2. 이미지 최적화
- 포맷: WebP (폴백: PNG/JPG)
- 크기: 800px × 600px 이상 1920px × 1080px 이하
- 압축: 80% 품질

### 3. 코드 분할 (프론트엔드)
```typescript
const CharacterSelector = React.lazy(() =>
  import('./components/CharacterSelector')
)
const ContentView = React.lazy(() =>
  import('./components/ContentView')
)
```

### 4. API 응답 최적화
- 필요한 필드만 반환
- 페이지 처리 구현
- gzip 압축 활성화

### 5. 데이터베이스 최적화 (향후)
- 인덱싱: character, topic, difficulty
- 쿼리 최적화
- 쿼리 결과 캐싱

---

## 확장성 계획

### Phase 1 (현재)
- 파일 시스템 기반 데이터 저장소
- 메모리 기반 캐싱
- 단일 서버 배포

**장점**: 빠른 개발, 간단한 설정
**제약사항**: 동시 사용자 수 제한

### Phase 2
**도입할 기술**:
- PostgreSQL 데이터베이스
- Redis 캐시
- Elasticsearch (검색 기능)

**아키텍처 변경**:
```
[클라이언트] → [로드 밸런서] → [API 서버]
                                    ↓
                            [PostgreSQL]
                            [Redis]
```

### Phase 3
**마이크로서비스 아키텍처**:
```
[클라이언트]
    ↓
[API Gateway]
    ├→ [콘텐츠 서비스]
    ├→ [TTS 서비스]
    ├→ [이미지 서비스]
    └→ [사용자 서비스]
```

### Phase 4
**글로벌 확장**:
- CloudFront / Cloudflare CDN
- 리전별 서버
- 다국어 지원
- AI 기반 콘텐츠 생성

---

## 배포 아키텍처

### 개발 환경
```
[개발자 로컬머신]
├── 프론트엔드 (npm start)
├── 백엔드 (npm run dev)
└── 데이터베이스 (로컬)
```

### 프로덕션 환경
```
[AWS]
├── CloudFront (CDN)
├── S3 (정적 자산)
├── ECS (컨테이너)
│   ├── API 서버 (2개 이상)
│   └── TTS 서비스
├── RDS (PostgreSQL)
├── ElastiCache (Redis)
└── Route 53 (DNS)
```

### 모니터링 및 로깅
```
[애플리케이션]
    ↓
[CloudWatch / ELK]
    ↓
[알람 및 대시보드]
```

---

## 설정 및 상수

### 백엔드 설정
```typescript
// config.ts
export const CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  TTS_CACHE_SIZE: 100,
  TTS_CACHE_TTL: 86400, // 24시간
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_MAX_REQUESTS: 10,
  MAX_CONTENT_LENGTH: 1048576, // 1MB
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080
}
```

### 프론트엔드 설정
```typescript
// config.ts
export const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  API_TIMEOUT: 30000,
  CACHE_STRATEGY: 'cache-first',
  LAZY_LOAD_THRESHOLD: 0.1
}
```

---

## 성공 메트릭

| 메트릭 | 목표 | 측정 방법 |
|--------|------|----------|
| 페이지 로드 시간 | < 2초 | Lighthouse, WebPageTest |
| TTI (Time to Interactive) | < 3.5초 | Lighthouse |
| 음성 생성 시간 | < 1초 | APM 도구 |
| 캐시 히트율 | > 80% | 로그 분석 |
| 에러율 | < 0.1% | 에러 추적 |
| 가용성 | > 99.5% | 헬스 체크 |
| 사용자 만족도 | > 4.5/5 | NPS, 설문조사 |

---

**다음 문서**: [TDD.md](TDD.md) - 테스트 설계 문서
**관련 문서**: [API.md](API.md) - API 명세, [DEVELOPMENT.md](DEVELOPMENT.md) - 개발 가이드
