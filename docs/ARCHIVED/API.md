# 🔌 API Documentation
## Animal Forest Coding - REST API 명세

**Version**: 1.0
**Last Updated**: 2024-11-30
**Base URL**: `http://localhost:5000/api` (개발) | `https://api.animalforestcoding.dev/api` (프로덕션)

---

## 📋 목차

1. [개요](#개요)
2. [인증](#인증)
3. [요청 형식](#요청-형식)
4. [응답 형식](#응답-형식)
5. [엔드포인트](#엔드포인트)
6. [에러 처리](#에러-처리)
7. [속도 제한](#속도-제한)
8. [캐싱 전략](#캐싱-전략)
9. [사용 예제](#사용-예제)

---

## 개요

### 특징
- ✅ RESTful API 설계
- ✅ JSON 요청/응답
- ✅ 표준 HTTP 메서드
- ✅ 속도 제한 (Rate Limiting)
- ✅ 캐싱 지원
- ✅ 상세한 에러 메시지

### 스택
- **Framework**: Express.js
- **Language**: TypeScript
- **Request/Response**: JSON
- **Authentication**: JWT (향후)

---

## 인증

### 현재
인증 없음 (공개 API)

### 향후 (Phase 2)
JWT 토큰 기반 인증

```
Authorization: Bearer <jwt_token>
```

---

## 요청 형식

### HTTP 헤더

```http
GET /api/content/Tom Nook/variables HTTP/1.1
Host: api.animalforestcoding.dev
Content-Type: application/json
Accept: application/json
User-Agent: MyClient/1.0
```

### 쿼리 파라미터
```
GET /api/topics?difficulty=beginner&limit=10&offset=0
```

### 요청 본문 (POST)
```json
{
  "text": "변수는 값을 저장하는 상자와 같습니다",
  "character": "Tom Nook"
}
```

---

## 응답 형식

### 성공 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "content_001",
    "character": "Tom Nook",
    "topic": "variables",
    "title": "변수란 무엇일까요?"
  },
  "metadata": {
    "timestamp": "2024-11-30T10:30:00Z",
    "version": "1.0"
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "요청한 콘텐츠를 찾을 수 없습니다",
    "statusCode": 404,
    "details": {
      "character": "Tom Nook",
      "topic": "variables"
    }
  }
}
```

---

## 엔드포인트

### 1. 캐릭터 관리

#### GET /characters
모든 사용 가능한 캐릭터 조회

**요청**:
```bash
curl -X GET "http://localhost:5000/api/characters" \
  -H "Content-Type: application/json"
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "char_tom_nook",
      "name": "Tom Nook",
      "species": "Raccoon",
      "description": "성공한 사업가",
      "imageUrl": "/images/characters/tom-nook.png",
      "voiceProfile": "business-formal",
      "specialties": ["variables", "functions", "data-structures"]
    },
    {
      "id": "char_isabelle",
      "name": "Isabelle",
      "species": "Shih Tzu",
      "description": "도시 비서",
      "imageUrl": "/images/characters/isabelle.png",
      "voiceProfile": "friendly-cheerful",
      "specialties": ["control-flow", "loops", "conditionals"]
    }
  ],
  "metadata": {
    "count": 2,
    "timestamp": "2024-11-30T10:30:00Z"
  }
}
```

**상태 코드**:
- `200 OK`: 성공
- `500 Internal Server Error`: 서버 오류

---

### 2. 콘텐츠 관리

#### GET /content/:character/:topic
특정 캐릭터와 주제의 콘텐츠 조회

**매개변수**:
| 매개변수 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| character | string | ✅ | 캐릭터 이름 (URL encoded) |
| topic | string | ✅ | 주제 슬러그 |

**요청**:
```bash
curl -X GET "http://localhost:5000/api/content/Tom%20Nook/variables" \
  -H "Content-Type: application/json"
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "content_001",
    "character": "Tom Nook",
    "topic": "variables",
    "title": "변수란 무엇일까요?",
    "description": "Tom Nook과 함께 변수의 개념을 배워봅시다",
    "text": "변수는 값을 저장하는 상자와 같습니다. 우리가 돈을 보관하는 은행의 계좌처럼, 컴퓨터도 데이터를 저장할 장소가 필요합니다...",
    "imageId": "img_variables_001",
    "imageUrl": "/images/content/variables-diagram.png",
    "difficulty": "beginner",
    "estimatedTime": 5,
    "tags": ["variables", "basics", "javascript"],
    "createdAt": "2024-11-30T10:00:00Z",
    "updatedAt": "2024-11-30T10:00:00Z"
  },
  "metadata": {
    "timestamp": "2024-11-30T10:30:00Z"
  }
}
```

**에러 응답** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "요청한 콘텐츠를 찾을 수 없습니다",
    "statusCode": 404,
    "details": {
      "character": "Tom Nook",
      "topic": "variables"
    }
  }
}
```

**상태 코드**:
- `200 OK`: 성공
- `400 Bad Request`: 잘못된 매개변수
- `404 Not Found`: 콘텐츠 없음
- `500 Internal Server Error`: 서버 오류

---

#### GET /topics
모든 주제 조회

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| difficulty | string | - | 난이도 필터 (beginner/intermediate/advanced) |
| limit | number | 20 | 반환 항목 수 |
| offset | number | 0 | 스킵 항목 수 |

**요청**:
```bash
curl -X GET "http://localhost:5000/api/topics?difficulty=beginner&limit=10" \
  -H "Content-Type: application/json"
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": [
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
    },
    {
      "id": "topic_functions",
      "name": "함수와 스코프",
      "slug": "functions",
      "description": "함수 정의, 호출, 스코프 이해",
      "difficulty": "beginner",
      "estimatedTime": 35,
      "contentCount": 6,
      "order": 2,
      "createdAt": "2024-11-30T10:00:00Z"
    }
  ],
  "metadata": {
    "count": 2,
    "totalCount": 10,
    "limit": 10,
    "offset": 0,
    "hasMore": false,
    "timestamp": "2024-11-30T10:30:00Z"
  }
}
```

---

### 3. 이미지 관리

#### GET /images/:imageId
이미지 조회 및 다운로드

**매개변수**:
| 매개변수 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| imageId | string | ✅ | 이미지 ID |

**요청**:
```bash
curl -X GET "http://localhost:5000/api/images/img_variables_001" \
  -H "Accept: image/*" \
  -o image.png
```

**응답** (200 OK):
```
[바이너리 이미지 데이터]

Headers:
- Content-Type: image/png
- Content-Length: 102400
- Cache-Control: public, max-age=604800
```

**캐시 헤더**:
```http
Cache-Control: public, max-age=604800
ETag: "5f8c5e0f"
Last-Modified: Mon, 30 Nov 2024 10:00:00 GMT
```

**상태 코드**:
- `200 OK`: 성공
- `304 Not Modified`: 캐시됨
- `404 Not Found`: 이미지 없음
- `500 Internal Server Error`: 서버 오류

---

#### GET /images/:imageId/metadata
이미지 메타데이터 조회

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
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
}
```

---

### 4. TTS (Text-to-Speech)

#### POST /tts
Animalese 음성 생성

**요청 본문**:
```json
{
  "text": "변수는 값을 저장하는 상자와 같습니다",
  "character": "Tom Nook"
}
```

**요청**:
```bash
curl -X POST "http://localhost:5000/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "변수는 값을 저장하는 상자와 같습니다",
    "character": "Tom Nook"
  }'
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "audio_001",
    "audioUrl": "/audio/tts/tom-nook-variables-001.mp3",
    "duration": 10.5,
    "mimeType": "audio/mpeg",
    "character": "Tom Nook",
    "textHash": "abc123def456",
    "cached": false,
    "createdAt": "2024-11-30T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2024-11-30T10:30:00Z",
    "processingTime": 850  // ms
  }
}
```

**검증**:
- `text` (필수): 1-1000자
- `character` (필수): 유효한 캐릭터 이름

**에러 응답** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "text는 필수 입력값입니다",
    "statusCode": 400,
    "validationErrors": {
      "text": ["필수 입력값입니다"]
    }
  }
}
```

**상태 코드**:
- `200 OK`: 음성 생성 성공
- `400 Bad Request`: 잘못된 입력
- `401 Unauthorized`: 인증 실패
- `429 Too Many Requests`: 속도 제한 초과
- `500 Internal Server Error`: 서버 오류

**속도 제한**:
- TTS는 분당 10개 요청으로 제한됨
- 제한 초과 시 429 상태 코드 반환

---

#### GET /audio/:audioId
생성된 음성 파일 조회

**매개변수**:
| 매개변수 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| audioId | string | ✅ | 음성 파일 ID |

**요청**:
```bash
curl -X GET "http://localhost:5000/api/audio/audio_001" \
  -H "Accept: audio/*" \
  -o audio.mp3
```

**응답** (200 OK):
```
[바이너리 음성 데이터]

Headers:
- Content-Type: audio/mpeg
- Content-Length: 51200
- Cache-Control: public, max-age=2592000
```

---

### 5. 헬스 체크

#### GET /health
API 상태 확인

**요청**:
```bash
curl -X GET "http://localhost:5000/api/health"
```

**응답** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-11-30T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "cache": "connected",
    "tts": "available"
  }
}
```

---

## 에러 처리

### 에러 코드

| 코드 | HTTP | 설명 | 해결책 |
|------|------|------|--------|
| INVALID_REQUEST | 400 | 잘못된 요청 형식 | 요청 형식 확인 |
| VALIDATION_ERROR | 400 | 입력 검증 실패 | 입력값 유효성 확인 |
| CONTENT_NOT_FOUND | 404 | 콘텐츠 없음 | 올바른 character/topic 확인 |
| CHARACTER_NOT_FOUND | 404 | 캐릭터 없음 | 유효한 캐릭터 이름 확인 |
| RATE_LIMIT_EXCEEDED | 429 | 속도 제한 초과 | 요청 수 줄이기 |
| INTERNAL_SERVER_ERROR | 500 | 서버 내부 오류 | 관리자 문의 |
| SERVICE_UNAVAILABLE | 503 | 서비스 불가 | 잠시 후 재시도 |

### 에러 응답 예제

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "너무 많은 요청이 발생했습니다",
    "statusCode": 429,
    "retryAfter": 60
  }
}
```

---

## 속도 제한

### 정책

```
일반 엔드포인트: 분당 100 요청
TTS 엔드포인트: 분당 10 요청
이미지 엔드포인트: 분당 50 요청
```

### 헤더

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701337800
Retry-After: 60
```

### 429 응답 예제

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "분당 10개 요청 제한을 초과했습니다",
    "statusCode": 429,
    "retryAfter": 60
  },
  "rateLimit": {
    "limit": 10,
    "remaining": 0,
    "reset": 1701337800
  }
}
```

---

## 캐싱 전략

### 서버 캐싱
```
TTS 결과: 최대 100개 항목, 24시간 만료
콘텐츠: 1시간 만료
이미지: 7일 만료
메타데이터: 1시간 만료
```

### 클라이언트 캐싱

**정적 자산**:
```
Cache-Control: public, max-age=31536000
```

**API 응답**:
```
Cache-Control: public, max-age=300
```

**이미지**:
```
Cache-Control: public, max-age=604800
ETag: "..." (조건부 요청)
Last-Modified: ... (조건부 요청)
```

---

## 사용 예제

### 1. JavaScript (Fetch API)

```javascript
// 캐릭터 목록 조회
const response = await fetch('http://localhost:5000/api/characters');
const result = await response.json();

if (result.success) {
  console.log('캐릭터:', result.data);
} else {
  console.error('에러:', result.error.message);
}
```

### 2. Python (Requests)

```python
import requests

# 콘텐츠 조회
url = 'http://localhost:5000/api/content/Tom%20Nook/variables'
response = requests.get(url)
data = response.json()

if data['success']:
    print('콘텐츠:', data['data'])
else:
    print('에러:', data['error']['message'])
```

### 3. cURL

```bash
# TTS 음성 생성
curl -X POST "http://localhost:5000/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "변수는 값을 저장하는 상자와 같습니다",
    "character": "Tom Nook"
  }' | jq
```

### 4. Axios (TypeScript)

```typescript
import axios from 'axios'

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000
})

// 주제 조회
const topics = await apiClient.get('/topics', {
  params: {
    difficulty: 'beginner',
    limit: 10
  }
})

console.log(topics.data.data)
```

### 5. 완전한 예제: 콘텐츠 및 음성 로드

```javascript
async function loadContentWithAudio(character, topic) {
  try {
    // 1. 콘텐츠 조회
    const contentRes = await fetch(
      `/api/content/${encodeURIComponent(character)}/${topic}`
    );
    const contentData = await contentRes.json();

    if (!contentData.success) {
      throw new Error(contentData.error.message);
    }

    // 2. 음성 생성
    const ttsRes = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: contentData.data.text,
        character: character
      })
    });
    const ttsData = await ttsRes.json();

    if (!ttsData.success) {
      throw new Error(ttsData.error.message);
    }

    // 3. 결과 반환
    return {
      content: contentData.data,
      audio: ttsData.data
    };
  } catch (error) {
    console.error('에러:', error.message);
    throw error;
  }
}

// 사용
loadContentWithAudio('Tom Nook', 'variables')
  .then(({ content, audio }) => {
    console.log('제목:', content.title);
    console.log('음성 URL:', audio.audioUrl);
  });
```

---

## 페이지네이션

### 쿼리 파라미터

```
GET /api/topics?limit=10&offset=20
```

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| limit | number | 20 | 반환 항목 수 (최대 100) |
| offset | number | 0 | 스킵 항목 수 |

### 응답 메타데이터

```json
{
  "metadata": {
    "count": 10,
    "totalCount": 150,
    "limit": 10,
    "offset": 20,
    "hasMore": true,
    "nextOffset": 30
  }
}
```

---

## WebSocket 지원 (향후)

### 실시간 기능

```javascript
const socket = io('http://localhost:5000');

socket.on('tts-progress', (data) => {
  console.log('음성 생성 진행률:', data.progress);
});
```

---

**다음 문서**: [TDD.md](TDD.md) - 테스트 설계 문서
**관련 문서**: [SDD.md](SDD.md) - 시스템 설계, [DEVELOPMENT.md](DEVELOPMENT.md) - 개발 가이드
