# Phase 2: Enhanced Admin Features & Drag-and-Drop

## 🎯 목표

Phase 1의 기본 CRUD 기능을 바탕으로 더 강력한 관리자 기능을 추가합니다.

**Phase 2 주요 목표**:
1. ✨ Drag-and-drop 기능으로 Scene 순서 변경 (직관적인 UI)
2. 📸 이미지 업로드 기능 (로컬 파일 + 미리보기)
3. 🎨 Scene 프리뷰 (학생 뷰 미리보기)
4. 📋 배치 작업 (다중 Scene/Mission 선택 및 수정)
5. 🔄 복사/붙여넣기 기능

## 📊 구현 계획

### 1. Drag-and-Drop 기능 (우선순위: 🔴 HIGH)

#### 1.1 라이브러리 선택
- **옵션 A**: React Beautiful DnD (추천 - 가장 직관적)
- **옵션 B**: react-dnd (더 강력함)
- **옵션 C**: react-sortable-hoc (가벼움)

**선택**: `react-beautiful-dnd` (사용하기 쉽고 애니메이션이 자연스러움)

#### 1.2 구현 계획

**a) Backend 이미 준비됨**:
```
PATCH /api/admin/episodes/:id/scenes/reorder
```

**b) Frontend 구현**:
```typescript
// SceneManager에 DragDropContext 추가
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="scenes-list">
    {scenes.map((scene, index) => (
      <Draggable key={scene.id} draggableId={scene.id} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div {...provided.dragHandleProps}>
              🔳 {scene.id}
            </div>
            {/* Scene item content */}
          </div>
        )}
      </Draggable>
    ))}
  </Droppable>
</DragDropContext>
```

**c) 저장 로직**:
```typescript
const handleDragEnd = async (result) => {
  const newOrder = reorder(scenes, result.source.index, result.destination.index);
  const sceneIds = newOrder.map(s => s.id);

  // API 호출
  await fetch(`/api/admin/episodes/${episodeId}/scenes/reorder`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ sceneOrder: sceneIds })
  });
};
```

### 2. 이미지 업로드 기능 (우선순위: 🔴 HIGH)

#### 2.1 Backend API 추가

```typescript
POST /api/admin/upload/image
Content-Type: multipart/form-data

Request:
{
  file: File,
  episodeId: string,
  type: 'scene' | 'mission' | 'bg'
}

Response:
{
  success: true,
  imageUrl: '/episode/1/uploads/abc123.jpg',
  fileSize: 245000,
  timestamp: '2025-12-05T10:30:00Z'
}
```

#### 2.2 Frontend 이미지 업로더 컴포넌트

```typescript
// ImageUploader.tsx
interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void;
  previewUrl?: string;
  disabled?: boolean;
}

// 기능:
// - 드래그앤드롭 지원
// - 파일 크기 제한 (Max 5MB)
// - 지원 형식 확인 (JPG, PNG, WebP)
// - 미리보기 표시
// - 진행률 표시
```

#### 2.3 구현 파일

```
backend/
├── src/
│   ├── middleware/
│   │   └── uploadHandler.ts  (New)
│   ├── services/
│   │   └── ImageUploadService.ts  (New)
│   └── routes/
│       └── admin/
│           └── uploads.ts  (New)

frontend/
├── src/
│   ├── components/
│   │   └── admin/
│   │       └── ImageUploader.tsx  (New)
│   └── services/
│       └── uploadService.ts  (New)
```

### 3. Scene 프리뷰 기능 (우선순위: 🟡 MEDIUM)

#### 3.1 Preview 컴포넌트

```typescript
// ScenePreview.tsx
interface ScenePreviewProps {
  scene: Scene;
  theme?: 'student' | 'admin';
}

// Story Scene Preview:
// - 이미지 표시
// - 대사 순차 표시 (1초 간격)
// - NPC 아바타
// - 배경음악 (옵션)

// IDE Scene Preview:
// - Mission 정보 표시
// - Problem + Template + Solution
// - 코드 실행 버튼 (미니 IDE)
// - 결과 표시

// Choice Scene Preview:
// - 질문 텍스트
// - 선택지 버튼
// - 다음 Scene으로 네비게이션
```

#### 3.2 구현 위치

```
frontend/src/components/admin/
├── ScenePreview.tsx  (New)
├── StoryPreview.tsx  (New)
├── IDEPreview.tsx    (New)
└── ChoicePreview.tsx  (New)
```

### 4. 배치 작업 (우선순위: 🟡 MEDIUM)

#### 4.1 다중 선택 기능

```typescript
// SceneManager에 추가
const [selectedScenes, setSelectedScenes] = useState<string[]>([]);

// 체크박스로 선택
<input
  type="checkbox"
  checked={selectedScenes.includes(scene.id)}
  onChange={() => toggleSceneSelection(scene.id)}
/>

// 선택된 Scene별 일괄 작업:
// - 삭제
// - 복사
// - 다른 Episode로 이동
// - Difficulty 변경
// - 태그 추가
```

#### 4.2 구현

```typescript
// BatchActions.tsx
interface BatchActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onCopy: () => void;
  onMove: (targetEpisodeId: string) => void;
}
```

### 5. 복사/붙여넣기 (우선순위: 🟢 LOW)

#### 5.1 기능 명세

```typescript
// Clipboard 기반
const copyScene = (sceneId: string) => {
  const scene = scenes.find(s => s.id === sceneId);
  localStorage.setItem('clipboard_scene', JSON.stringify(scene));
  showNotification('Scene copied!');
};

const pasteScene = async () => {
  const sceneData = JSON.parse(localStorage.getItem('clipboard_scene'));
  const newScene = { ...sceneData, id: generateNewId() };
  await createScene(newScene);
};
```

## 📈 구현 순서

### Week 1-2: Drag-and-Drop (4일)
1. react-beautiful-dnd 설치
2. SceneList에 DragDropContext 추가
3. Draggable Scene Items 구현
4. handleDragEnd 로직 및 API 호출
5. CSS 애니메이션 추가
6. 테스트

### Week 2-3: 이미지 업로드 (4일)
1. Backend: ImageUploadService 구현
2. Backend: upload 라우터 추가
3. Frontend: ImageUploader 컴포넌트
4. 드래그앤드롭 파일 업로드
5. 미리보기 기능
6. 파일 검증 (크기, 형식)
7. 테스트

### Week 3: Scene 프리뷰 (3일)
1. ScenePreview 컴포넌트
2. Story/IDE/Choice 프리뷰
3. Modal에서 전체 미리보기
4. 학생 뷰 시뮬레이션
5. 테스트

### Week 4: 배치 작업 (3일)
1. 다중 선택 UI
2. BatchActions 컴포넌트
3. 일괄 삭제/복사/이동
4. 확인 모달
5. 테스트

### Week 5: 추가 기능 (2일)
1. 복사/붙여넣기
2. 검색 및 필터링
3. 최근 작업 히스토리
4. 통합 테스트

## 🔧 기술 스택 (Phase 2)

**새로 추가될 라이브러리**:
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "multer": "^1.4.5",
  "sharp": "^0.32.0",
  "react-dropzone": "^14.2.3"
}
```

## 📊 API 변경 사항

### 추가될 Endpoints

```
# 이미지 업로드
POST /api/admin/upload/image
GET /api/admin/uploads/list?episodeId=:id
DELETE /api/admin/uploads/:imageId

# Scene 프리뷰 (기존 학생 API 재사용)
GET /api/scenes/:sceneId

# 배치 작업
POST /api/admin/scenes/batch/copy
POST /api/admin/scenes/batch/delete
POST /api/admin/scenes/batch/move
```

## 🎨 UI/UX 개선

### SceneManager 개선
```
┌─────────────────────────────────────┐
│ Scene Manager                       │
├─────────────────────────────────────┤
│ [✓] Select All  [Delete] [Copy] [+] │
├─────────────────────────────────────┤
│ ☰ [✓] Scene 1 - Story               │
│ ☰ [✓] Scene 2 - IDE                 │
│ ☰ [ ] Scene 3 - Choice              │
├─────────────────────────────────────┤
│ 2 scenes selected                   │
└─────────────────────────────────────┘
```

### ImageUploader UI
```
┌─────────────────────────────────────┐
│ Drop image here or click to select  │
│                                     │
│        📁 Select File               │
│                                     │
│ Supported: JPG, PNG, WebP (Max 5MB) │
│                                     │
│ ✓ preview.jpg (245 KB)              │
│   [Replace] [Delete]                │
└─────────────────────────────────────┘
```

## 📝 문서 및 테스트

### 테스트 계획
1. **Unit Tests**: ImageUploadService, reorder logic
2. **Integration Tests**: API + Frontend 상호작용
3. **E2E Tests**: Drag-and-drop, 파일 업로드 전체 흐름
4. **성능 테스트**: 대량 Scene 드래그(1000+)

### 문서 생성
- `PHASE_2_IMPLEMENTATION_GUIDE.md`
- `API_DOCUMENTATION.md` (Update)
- `DRAG_AND_DROP_GUIDE.md`
- `IMAGE_UPLOAD_GUIDE.md`

## ✅ 체크리스트

### 개발 체크리스트
- [ ] react-beautiful-dnd 설치 및 통합
- [ ] SceneManager에 Drag-and-drop 구현
- [ ] Backend 이미지 업로드 API 구현
- [ ] Frontend ImageUploader 컴포넌트
- [ ] Scene 프리뷰 컴포넌트
- [ ] 배치 작업 UI
- [ ] 통합 테스트

### 테스트 체크리스트
- [ ] 드래그앤드롭 기능 (5개 Scene 이상)
- [ ] 이미지 업로드 (JPG, PNG, WebP)
- [ ] 파일 크기 제한 (>5MB 거부)
- [ ] Scene 프리뷰 (모든 타입)
- [ ] 배치 삭제 (10개 Scene)
- [ ] API 응답 시간 (<500ms)

### 배포 체크리스트
- [ ] 모든 새 파일 추가
- [ ] 테스트 통과
- [ ] 문서 업데이트
- [ ] 성능 측정
- [ ] 보안 검토

## 🚀 예상 결과

### Phase 2 완료 후
- ✨ 직관적인 드래그앤드롭 UI
- 📸 간편한 이미지 관리
- 👁️ 학생 뷰 미리보기
- ⚡ 빠른 배치 작업
- 📊 전문적인 관리자 대시보드

## 📞 질문 및 피드백

- 라이브러리 선택에 대해 의견이 있으신가요?
- 추가하고 싶은 기능이 있으신가요?
- 구현 순서를 변경하고 싶으신가요?

---

**다음 단계**: Phase 2 개발 시작 ✋ 승인 대기

생성: 2025-12-05
