# Frontend Integration Guide

**Last Updated**: 2025-11-30
**Backend Status**: ✅ Running and Tested
**Backend URL**: http://localhost:5000/api

---

## Quick Start for Frontend Integration

The backend is fully operational and ready for React frontend integration. This guide shows how to connect your React components to the API.

---

## 1. API Base Configuration

### In `frontend/src/services/apiClient.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Environment Variable (`.env`):

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## 2. Fetch Characters

### API Call:

```typescript
// GET /api/characters
const response = await apiClient.get('/characters');
```

### Response Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "char_tom_nook",
      "name": "Tom Nook",
      "species": "Raccoon",
      "description": "성공한 사업가 Tom Nook",
      "imageUrl": "/images/characters/tom-nook.png",
      "voiceProfile": "business-formal",
      "specialties": ["variables", "functions", "data-structures"],
      "createdAt": "2024-11-30T10:00:00Z"
    },
    // ... 5 more characters
  ],
  "metadata": {
    "count": 6,
    "timestamp": "2025-11-30T08:16:09.699Z"
  }
}
```

### React Hook Usage (`useContent.ts`):

```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { data } = await apiClient.get('/characters');
        setCharacters(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return { characters, loading, error };
}
```

---

## 3. Fetch Learning Topics

### API Call:

```typescript
// GET /api/topics
const response = await apiClient.get('/topics');
```

### Response Example:

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
      "contentCount": 3,
      "order": 1,
      "createdAt": "2024-11-30T10:00:00Z"
    },
    // ... 6 more topics
  ],
  "metadata": {
    "count": 7,
    "totalCount": 7,
    "limit": 20,
    "offset": 0,
    "hasMore": false,
    "timestamp": "2025-11-30T08:16:09.699Z"
  }
}
```

### React Hook Usage:

```typescript
export function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data } = await apiClient.get('/topics');
        setTopics(data.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { topics, loading };
}
```

---

## 4. Fetch Content for Character & Topic

### API Call:

```typescript
// GET /api/content/:characterId/:topicSlug
const response = await apiClient.get(`/content/char_tom_nook/variables`);
```

### Important Notes:
- **Character ID**: Use the full ID (e.g., `char_tom_nook`, not `tom-nook`)
- **Topic**: Use the slug (e.g., `variables`, not `topic_variables`)

### Response Example:

```json
{
  "success": true,
  "data": {
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
    "createdAt": "2024-11-30T10:00:00Z"
  },
  "metadata": {
    "timestamp": "2025-11-30T08:16:09.699Z"
  }
}
```

### React Hook Usage (existing `useContent.ts`):

```typescript
export function useContent(characterId: string, topicSlug: string) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!characterId || !topicSlug) return;

    const fetchContent = async () => {
      try {
        const { data } = await apiClient.get(
          `/content/${characterId}/${topicSlug}`
        );
        setContent(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [characterId, topicSlug]);

  return { content, loading, error };
}
```

---

## 5. Fetch Image Binary Data

### API Call:

```typescript
// GET /api/images/:imageId
// Returns: JPEG binary data
const response = await apiClient.get(`/images/img_variables_001`, {
  responseType: 'blob',
});
const imageUrl = URL.createObjectURL(response.data);
```

### Response:
- **Type**: Binary (JPEG)
- **Size**: 125 KB (img_variables_001)
- **Dimensions**: 1024 × 559 pixels

### React Component Usage:

```typescript
export function ImageDisplay({ imageId }: { imageId: string }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!imageId) return;

    const fetchImage = async () => {
      try {
        const { data } = await apiClient.get(`/images/${imageId}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(data);
        setImageUrl(url);
      } catch (err) {
        console.error('Error fetching image:', err);
      }
    };

    fetchImage();
  }, [imageId]);

  return (
    <img
      src={imageUrl}
      alt="Learning content"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
```

---

## 6. Fetch Image Metadata (Without Binary)

### API Call:

```typescript
// GET /api/images/:imageId/metadata
const response = await apiClient.get(`/images/img_variables_001/metadata`);
```

### Response Example:

```json
{
  "success": true,
  "data": {
    "id": "img_variables_001",
    "filename": "variables-diagram.jpg",
    "mimeType": "image/jpeg",
    "size": 127938,
    "width": 1024,
    "height": 559,
    "altText": "변수 메모리 구조 다이어그램",
    "url": "/images/variables-diagram.jpg",
    "createdAt": "2024-11-30T10:00:00Z"
  },
  "metadata": {
    "timestamp": "2025-11-30T08:16:31.227Z"
  }
}
```

### Use Case:
Fetch metadata to get dimensions and other info before loading the binary data.

---

## 7. Generate Voice (TTS)

### API Call:

```typescript
// POST /api/tts
const response = await apiClient.post('/tts', {
  text: '변수는 값을 저장하는 상자와 같습니다',
  character: 'char_tom_nook',
});
```

### Request:

```json
{
  "text": "Learning content text (max 1000 chars)",
  "character": "char_tom_nook"  // Use character ID
}
```

### Response Example:

```json
{
  "success": true,
  "data": {
    "id": "audio_1764490574852",
    "audioUrl": "/audio/tts/char_tom_nook-1764490574853.mp3",
    "duration": 10.5,
    "mimeType": "audio/mpeg",
    "character": "char_tom_nook",
    "size": 1028,
    "cached": false,
    "createdAt": "2025-11-30T08:16:14.853Z"
  },
  "metadata": {
    "timestamp": "2025-11-30T08:16:14.853Z",
    "processingTime": 0.123
  }
}
```

### React Hook Usage (existing `useAudio.ts`):

```typescript
export function useAudio() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateAudio = async (text, characterId) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/tts', {
        text,
        character: characterId,
      });
      setAudioUrl(data.data.audioUrl);
      return data.data.audioUrl;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return {
    audioUrl,
    audioRef,
    loading,
    error,
    isPlaying,
    generateAudio,
    playAudio,
    stopAudio,
  };
}
```

---

## 8. Search Content

### API Call:

```typescript
// GET /api/search?q=변수
const response = await apiClient.get('/search', {
  params: { q: '변수' },
});
```

### Response Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "content_001",
      "character": "Tom Nook",
      "topic": "variables",
      "title": "변수란 무엇일까요?",
      // ... other content fields
    }
  ],
  "metadata": {
    "count": 1,
    "timestamp": "2025-11-30T08:16:31.227Z"
  }
}
```

---

## Complete User Flow Example

### 1. Load All Data on App Mount

```typescript
// App.tsx
import { useEffect, useState } from 'react';
import { apiClient } from './services/apiClient';

export function App() {
  const [characters, setCharacters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [content, setContent] = useState(null);

  // Load characters and topics on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [charsRes, topicsRes] = await Promise.all([
          apiClient.get('/characters'),
          apiClient.get('/topics'),
        ]);

        setCharacters(charsRes.data.data);
        setTopics(topicsRes.data.data);

        // Auto-select first character
        setSelectedCharacter(charsRes.data.data[0].id);
        setSelectedTopic(topicsRes.data.data[0].slug);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Load content when character or topic changes
  useEffect(() => {
    if (!selectedCharacter || !selectedTopic) return;

    const loadContent = async () => {
      try {
        const { data } = await apiClient.get(
          `/content/${selectedCharacter}/${selectedTopic}`
        );
        setContent(data.data);
      } catch (err) {
        console.error('Error loading content:', err);
      }
    };

    loadContent();
  }, [selectedCharacter, selectedTopic]);

  return (
    <div className="app">
      {/* Character selector */}
      <CharacterSelector
        characters={characters}
        selectedCharacter={selectedCharacter}
        onSelect={setSelectedCharacter}
      />

      {/* Topic selector */}
      <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
        {topics.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Content display */}
      {content && (
        <ContentDisplay
          content={content}
          selectedCharacter={selectedCharacter}
        />
      )}
    </div>
  );
}
```

### 2. Display Content with Image and Audio

```typescript
// ContentDisplay.tsx
import { useAudio } from '../hooks/useAudio';
import { ImageDisplay } from './ImageDisplay';

export function ContentDisplay({ content, selectedCharacter }) {
  const { generateAudio, audioUrl, playAudio, stopAudio, isPlaying } = useAudio();

  // Auto-generate audio when content changes
  useEffect(() => {
    if (content?.text && selectedCharacter) {
      generateAudio(content.text, selectedCharacter);
    }
  }, [content, selectedCharacter]);

  return (
    <div className="content">
      <h2>{content.title}</h2>
      <p>{content.description}</p>

      {/* Display image */}
      {content.imageId && <ImageDisplay imageId={content.imageId} />}

      {/* Display learning text */}
      <div className="learning-text">
        {content.text}
      </div>

      {/* Audio player */}
      {audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          character={selectedCharacter}
          isPlaying={isPlaying}
          onPlay={() => playAudio(audioUrl)}
          onStop={stopAudio}
        />
      )}
    </div>
  );
}
```

---

## Error Handling

### Typical Error Responses:

```json
{
  "success": false,
  "error": {
    "code": "CHARACTER_NOT_FOUND",
    "message": "Character not found: invalid-id",
    "statusCode": 404
  }
}
```

### React Error Handling:

```typescript
async function fetchWithErrorHandling(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.response) {
      // API error
      const { status, data } = err.response;
      console.error(`API Error ${status}:`, data.error.message);

      // Show user-friendly message
      if (status === 404) {
        return { error: 'Content not found' };
      } else if (status === 429) {
        return { error: 'Too many requests. Please try again later.' };
      } else {
        return { error: data.error.message };
      }
    } else {
      // Network error
      console.error('Network error:', err.message);
      return { error: 'Network error. Please check your connection.' };
    }
  }
}
```

---

## Rate Limiting

The API has rate limiting to prevent abuse:

- **TTS Endpoint**: 10 requests/minute per IP
- **Other Endpoints**: 100 requests/minute per IP

### Handling Rate Limit (429 Response):

```typescript
if (error.response?.status === 429) {
  alert('Please wait a moment before trying again');
}
```

---

## Development Checklist

- [ ] **Frontend Setup**
  - [ ] Install React dependencies: `npm install`
  - [ ] Configure environment variable (REACT_APP_API_BASE_URL)
  - [ ] Start dev server: `npm start`

- [ ] **Backend Verification**
  - [ ] Backend running on http://localhost:5000
  - [ ] Health endpoint responds: `curl http://localhost:5000/api/health`

- [ ] **Component Integration**
  - [ ] CharacterSelector displays 6 characters
  - [ ] Topic dropdown shows 7 topics
  - [ ] ContentDisplay shows content and image
  - [ ] AudioPlayer generates and plays voice

- [ ] **Testing**
  - [ ] Characters load correctly
  - [ ] Content changes when topic selected
  - [ ] Images display properly
  - [ ] Voice generation works
  - [ ] Search functionality works

---

## API Summary Table

| Operation | Method | Endpoint | Response |
|-----------|--------|----------|----------|
| Get Characters | GET | `/characters` | `[Character]` |
| Get Topics | GET | `/topics` | `[Topic]` |
| Get Content | GET | `/content/:charId/:topicSlug` | `Content` |
| Get Image (Binary) | GET | `/images/:imageId` | `Blob` (JPEG) |
| Get Image Metadata | GET | `/images/:imageId/metadata` | `ImageMetadata` |
| Search Content | GET | `/search?q=keyword` | `[Content]` |
| Generate Voice | POST | `/tts` | `AudioData` |
| Check Health | GET | `/health` | `HealthStatus` |

---

## Support

If you encounter issues during integration:

1. Check backend is running: `curl http://localhost:5000/api/health`
2. Verify character ID format: should be like `char_tom_nook`
3. Verify topic slug: should be like `variables` (not `topic_variables`)
4. Check console for error messages
5. Review the API_TEST_RESULTS.md for detailed endpoint examples

---

**Backend Ready**: ✅ All endpoints tested and working
**Frontend Ready**: ⏳ Ready for integration with provided examples above
