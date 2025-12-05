# Scene-IDE 통합 설계 문서
# Integrated Scene-IDE Management System Design

**작성일**: 2025-12-05
**목적**: Scene 관리, IDE 통합, 문제-정답 시스템의 통합 아키텍처

---

## 📌 핵심 개념

### 현재 문제점
```
❌ StoryPage.tsx
   └─ Scenes 데이터 하드코딩
      └─ Scene = 이미지 + 텍스트만 가능
         └─ IDE와의 연결 불명확

❌ IDEPage.tsx
   └─ Mission 데이터는 있음
      └─ 근데 문제(problem)와 정답(solution)이 분리됨
         └─ 학생 코드와 정답 코드 비교 불가
            └─ IDE 내에서 힌트/해법 제시 불가
```

### 해결 방향
```
✅ 통합된 Scene-Mission 시스템
   ├─ Scene = 스토리 진행 단위
   │  ├─ 타입1: 이미지+텍스트 (스토리 진행)
   │  ├─ 타입2: IDE+미션 (코딩)
   │  └─ 타입3: 분기선택 (경로 선택)
   │
   ├─ Mission = 실제 코딩 문제
   │  ├─ Problem (문제 설명)
   │  ├─ Template (시작 코드)
   │  ├─ Solution (정답 코드) ← NEW
   │  ├─ TestCases (검증)
   │  └─ Hints (힌트들)
   │
   └─ Episode = 에피소드 (장)
      └─ Scenes[] (순서대로)
         └─ 각 Scene이 Mission을 참조
```

---

## 🏗️ 시스템 아키텍처

### 1. 데이터 계층 (Data Layer)

#### Episode 구조
```json
{
  "id": "ep_1",
  "title": "Java 기초",
  "episodeNumber": 1,
  "description": "Java 변수와 기초 개념 배우기",
  "scenes": ["scene_1", "scene_2", ..., "scene_10"]
}
```

#### Scene 구조 (새로운 통합 모델)
```json
{
  "id": "scene_5",
  "episodeId": "ep_1",
  "sceneNumber": 5,
  "sceneType": "ide-mission",  // ← 타입별 다르게 처리
  "title": "변수 미션",

  // 타입별 콘텐츠 (union type)
  "content": {
    // 타입 1: 스토리 진행
    "image": "/episode/1/5.jpg",
    "dialogues": ["대사1", "대사2"],
    "character": "tom_nook",

    // 타입 2: IDE 미션 (이 예제)
    "missionId": "mission-001",
    "showSolution": true,      // ← 정답 코드 표시 여부
    "solutionPosition": "right" // ← 정답 위치: right / bottom
  },

  "metadata": {
    "duration": 15,
    "difficulty": "beginner"
  }
}
```

#### Mission 구조 (확장된 모델)
```json
{
  "id": "mission-001",
  "title": "변수 선언",
  "description": "정수 변수 선언하기",

  "problem": {
    "title": "Nook의 빚 기록하기",
    "description": "너굴이 49,800벨을 변수에 저장하도록 도와주세요",
    "prompt": "정수 변수 'debt'를 선언하고 49800을 할당하세요",
    "language": "java"
  },

  "template": {
    "code": "public class Solution {\n  public static void main(String[] args) {\n    // debt 변수를 여기에 선언하세요\n    \n    System.out.println(debt);\n  }\n}",
    "startLine": 3,
    "endLine": 3
  },

  // ✅ NEW: 정답 코드
  "solution": {
    "code": "public class Solution {\n  public static void main(String[] args) {\n    int debt = 49800;\n    System.out.println(debt);\n  }\n}",
    "explanation": "int 타입으로 정수 변수를 선언합니다. 변수명은 debt, 초기값은 49800입니다.",
    "keyPoints": [
      "int는 정수 타입",
      "변수명은 소문자로 시작 (camelCase)",
      "= 기호로 값을 할당",
      "세미콜론으로 문장을 끝냄"
    ]
  },

  "testCases": [
    {
      "name": "변수 선언 확인",
      "input": [],
      "expectedOutput": "49800",
      "explanation": "debt 변수가 올바르게 선언되었는지 확인"
    }
  ],

  "hints": [
    {
      "level": 1,
      "content": "int debt = 값; 형식으로 선언하세요"
    },
    {
      "level": 2,
      "content": "int debt = 49800;"
    }
  ],

  "rewards": {
    "basePoints": 500,
    "speedBonus": 50,
    "perfectBonus": 100
  }
}
```

---

## 🎯 Frontend 컴포넌트 구조

### Scene Manager Page (새로운 관리 페이지)
```
SceneManagerPage
├─ EpisodeSelector (에피소드 선택)
├─ SceneList (Scene 목록, Drag-drop)
├─ SceneEditor (선택된 Scene 편집)
│  ├─ SceneTypeSelector (타입 선택: story/ide/choice)
│  ├─ ImageTextEditor (이미지 + 텍스트 편집)
│  ├─ IDEMissionEditor (IDE 미션 편집)
│  │  ├─ MissionSelector (미션 선택 또는 생성)
│  │  ├─ SolutionCodeEditor (정답 코드)
│  │  └─ SolutionDisplay (정답 표시 방식 설정)
│  └─ MetadataEditor (메타데이터)
└─ PreviewPane (우측: 미리보기)
```

### 수정된 StoryPage
```
StoryPage
├─ useEffect: fetchScenes() → API에서 Scene 로드
├─ SceneTypeDispatcher
│  ├─ StorySceneRenderer (image + text)
│  ├─ IDESceneRenderer (IDE + Mission)
│  │  ├─ CodeEditor (학생 코드)
│  │  ├─ SolutionPanel (정답 - 토글 가능)
│  │  ├─ OutputPanel (실행 결과)
│  │  └─ HintsPanel (힌트들)
│  └─ ChoiceSceneRenderer (선택지)
└─ NavigationButtons (다음/이전)
```

### 수정된 IDEPage
```
IDEPage
├─ MissionSelector
├─ EditorTabs
│  ├─ ProblemTab
│  │  ├─ ProblemDescription
│  │  ├─ SolutionPreview (토글 가능)
│  │  └─ HintsList
│  ├─ EditorTab
│  │  ├─ CodeEditor
│  │  ├─ ExecuteButton
│  │  └─ OutputConsole
│  └─ ProgressTab
└─ ResetCodeButton (정답으로 채우는 옵션)
```

---

## 🔌 Backend API 설계

### 1. Scene 관리 API

#### GET /api/episodes/:episodeId/scenes
```
응답:
{
  "episodeId": "ep_1",
  "scenes": [
    {
      "id": "scene_1",
      "sceneType": "image-text",
      "title": "무인도 도착",
      "content": { ... }
    },
    {
      "id": "scene_5",
      "sceneType": "ide-mission",
      "title": "변수 미션",
      "content": {
        "missionId": "mission-001",
        "showSolution": true
      }
    }
  ]
}
```

#### POST /api/episodes/:episodeId/scenes
```
요청:
{
  "sceneType": "ide-mission",
  "title": "새로운 미션",
  "content": { ... }
}

응답:
{
  "id": "scene_11",
  "episodeId": "ep_1",
  "sceneNumber": 11,
  ...
}
```

#### PUT /api/episodes/:episodeId/scenes/:sceneId
```
요청: 수정할 Scene 데이터
응답: 수정된 Scene
```

#### DELETE /api/episodes/:episodeId/scenes/:sceneId
```
응답: { success: true }
```

#### PATCH /api/episodes/:episodeId/scenes/reorder
```
요청:
{
  "sceneOrder": ["scene_1", "scene_3", "scene_2", ...]
}

응답:
{
  "success": true,
  "newOrder": [...]
}
```

### 2. Mission 관리 API (확장)

#### GET /api/missions/:missionId
```
응답:
{
  "id": "mission-001",
  "problem": { ... },
  "solution": { ... },      ← NEW
  "template": { ... },
  "testCases": [ ... ],
  "hints": [ ... ]
}
```

#### GET /api/missions/:missionId/solution
```
응답 (관리자/교사만 접근 가능):
{
  "code": "...",
  "explanation": "...",
  "keyPoints": [ ... ]
}
```

#### POST /api/missions/:missionId/compare
```
요청:
{
  "studentCode": "...",
  "missionId": "mission-001"
}

응답:
{
  "studentCode": "...",
  "solutionCode": "...",
  "similarities": 0.85,     // 유사도
  "suggestions": [
    "변수 이름을 더 명확하게 하세요",
    "주석을 추가하세요"
  ],
  "correctOutput": true,
  "testsPassed": 3,
  "totalTests": 3
}
```

### 3. Scene 콘텐츠 API

#### GET /api/scenes/:sceneId/preview
```
Scene의 HTML 미리보기 반환 (관리자 페이지용)
```

---

## 🗄️ Database Schema

### Episodes Table
```sql
CREATE TABLE episodes (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  episode_number INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scenes Table
```sql
CREATE TABLE scenes (
  id VARCHAR(50) PRIMARY KEY,
  episode_id VARCHAR(50) REFERENCES episodes(id),
  scene_number INT NOT NULL,
  scene_type ENUM('image-text', 'ide-mission', 'choice') NOT NULL,
  title VARCHAR(255),
  content JSON NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(episode_id, scene_number)
);
```

### Missions Table (확장)
```sql
CREATE TABLE missions (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(20),
  difficulty VARCHAR(20),
  problem JSON NOT NULL,
  template JSON NOT NULL,
  solution JSON NOT NULL,         -- ← NEW
  test_cases JSON NOT NULL,
  hints JSON,
  points INT DEFAULT 500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎬 사용 흐름

### 학생 관점
```
1. 스토리 페이지 시작
   ↓
2. Scene 1-4: 스토리 진행 (이미지 + 텍스트)
   ↓
3. Scene 5: IDE 미션 "변수 선언"
   - 문제 설명 표시
   - 코드 에디터에서 작성
   - "정답 보기" 버튼으로 해법 확인 가능
   - 힌트 요청 가능
   ↓
4. 코드 실행 → 테스트 케이스 검증
   ↓
5. Scene 6-10: 계속 진행
```

### 관리자 관점 (새로운 Scene Manager)
```
1. 에피소드 선택
   ↓
2. Scene 목록 표시 (Drag-drop으로 순서 변경)
   ↓
3. Scene 추가/수정/삭제
   - 타입 선택 (story / ide-mission / choice)
   - 콘텐츠 편집 (타입별 에디터)
   - 미션 선택 또는 생성
   - 정답 코드 입력/편집
   ↓
4. 미리보기에서 실제 렌더링 확인
   ↓
5. 저장 → 학생이 즉시 볼 수 있음
```

---

## 💾 파일 구조 (새로운 것만)

### Backend
```
backend/src/
├─ services/
│  ├─ SceneService.ts         (← NEW: Scene CRUD)
│  ├─ MissionService.ts       (← UPDATE: solution 추가)
│  └─ SceneRenderService.ts   (← NEW: Scene 타입별 렌더링)
│
├─ routes/
│  ├─ scenes.ts               (← NEW: Scene API)
│  └─ missions.ts             (← UPDATE: solution 엔드포인트)
│
└─ data/
   ├─ episodes/
   │  └─ episode-1.json       (← NEW: Episode 메타데이터)
   │
   └─ missions/
      └─ mission-001-variables.json
         (← UPDATE: solution 필드 추가)

```

### Frontend
```
frontend/src/
├─ pages/
│  ├─ StoryPage.tsx           (← UPDATE: Scene API 연동)
│  ├─ SceneManagerPage.tsx    (← NEW: 관리자 페이지)
│  └─ IDEPage.tsx             (← UPDATE: solution 표시)
│
└─ components/
   ├─ SceneRenderer/
   │  ├─ SceneDispatcher.tsx   (← NEW: 타입별 렌더링)
   │  ├─ StorySceneRenderer.tsx
   │  ├─ IDESceneRenderer.tsx
   │  └─ ChoiceSceneRenderer.tsx
   │
   ├─ SceneManager/
   │  ├─ EpisodeSelector.tsx   (← NEW)
   │  ├─ SceneList.tsx         (← NEW)
   │  ├─ SceneEditor.tsx       (← NEW)
   │  └─ SolutionEditor.tsx    (← NEW)
   │
   └─ IDEComponents/
      ├─ SolutionPanel.tsx     (← NEW: 정답 표시)
      └─ HintsList.tsx         (← NEW)
```

---

## 📊 구현 순서

### Phase 1: Backend 구축 (2-3일)
- [ ] Missions JSON에 solution 필드 추가
- [ ] SceneService 구현
- [ ] Scene API 엔드포인트 작성
- [ ] Episodes 데이터 생성

### Phase 2: Frontend 관리 페이지 (2-3일)
- [ ] SceneManagerPage 컴포넌트
- [ ] Scene CRUD UI
- [ ] Drag-drop 순서 변경
- [ ] 미리보기 기능

### Phase 3: StoryPage 리팩토링 (2일)
- [ ] Scene 타입별 Renderer 분리
- [ ] API 연동
- [ ] IDE Scene 렌더링
- [ ] Solution 토글 기능

### Phase 4: IDEPage 개선 (1-2일)
- [ ] SolutionPanel 추가
- [ ] 정답 비교 기능
- [ ] 힌트 시스템

---

## 🎓 사용 예시

### 학생이 정답을 볼 때
```
IDE 미션 씬:
┌─────────────────────────────────────────┐
│ 변수 선언 미션                            │
├─────────────────────────────────────────┤
│ 문제:                                   │
│ Nook의 빚 49,800벨을 변수에 저장하세요 │
├─────────────────────────────────────────┤
│ [정답 보기] ← 클릭하면 아래 표시        │
├─────────────────────────────────────────┤
│ 정답 코드:                              │
│ public class Solution {                 │
│   public static void main(String[]) {   │
│     int debt = 49800;                   │
│     System.out.println(debt);           │
│   }                                     │
│ }                                       │
├─────────────────────────────────────────┤
│ 주요 포인트:                            │
│ • int는 정수 타입                       │
│ • 변수명은 소문자로 시작                 │
│ • 세미콜론으로 문장을 끝냄              │
└─────────────────────────────────────────┘
```

---

## ✅ 핵심 이점

1. **유연성**: Scene 타입을 자유롭게 조합 가능
2. **확장성**: 새로운 Scene 타입 추가 용이
3. **관리 편의성**: 웹 UI로 콘텐츠 관리
4. **학습 효과**: 정답과 비교 → 학습 효율 향상
5. **재사용성**: Mission을 여러 Scene에서 사용 가능

---

## 🚀 다음 단계

1. Mission JSON 파일에 solution 필드 추가
2. Backend SceneService 구현
3. Frontend Scene Manager 페이지 구축
4. StoryPage 리팩토링

어느 부분부터 시작할까요?
