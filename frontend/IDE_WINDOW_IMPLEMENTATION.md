# 너굴포트 IDE 윈도우 매니저 구현 완료 보고서

## 📋 요약

StoryPage 내에서 너굴포트 IDE를 Windows 스타일의 독립적인 창으로 사용할 수 있는 IDEWindowManager 컴포넌트를 구현했습니다. 사용자는 미니 뷰에서 코드 작성/실행은 물론이고, 전체 화면으로 확장하거나 최소화할 수 있습니다.

---

## 🎯 주요 기능

### 1. **드래그 가능한 창 (Draggable Window)**
- 제목 표시줄을 마우스로 드래그하여 창 위치 변경
- 화면 경계를 벗어나지 않도록 자동 제약
- 드래그 중 시각적 피드백 (커서 변경, 그림자 강화)

### 2. **크기 조절 (Resize)**
- 창의 8가지 방향(모서리+중간)에서 마우스로 드래그하여 크기 조절
- 최소 크기: 300x500px
- 최대 크기: 화면 크기에 맞춤
- 부드러운 리사이즈 경험

### 3. **최소화 (Minimize)**
- 제목 표시줄의 [−] 버튼 클릭
- 화면 하단에 미니 아이콘으로 축소
- 미니 아이콘 클릭으로 즉시 복원
- 단축키: `Alt+M`

### 4. **최대화 (Maximize)**
- 제목 표시줄의 [□] 버튼 클릭
- IDE가 전체 화면으로 확장
- 다시 클릭하면 이전 크기로 복원
- 단축키: `Alt+X`

### 5. **닫기 (Close)**
- 제목 표시줄의 [✕] 버튼 클릭
- IDE 창이 숨겨짐
- 우측 하단의 [🚀 IDE] 버튼으로 재열기
- 단축키: `Esc`

### 6. **상태 자동 저장 (Auto Save)**
- 창의 위치, 크기, 최소화/최대화 상태를 localStorage에 자동 저장
- 페이지 새로고침 후에도 이전 상태 복원
- 500ms 디바운스로 저장 빈도 최소화

---

## 📁 구현된 파일들

### 1. **IDE_EMBED_SPEC.md** (기술 사양서)
- 전체 기능 설계서
- UI 구조 및 스타일 명세
- 상태 관리 설계
- 구현 순서 계획

### 2. **IDEWindowManager.tsx** (메인 컴포넌트)
**경로**: `frontend/src/components/IDEWindowManager.tsx` (약 350줄)

**주요 기능**:
```typescript
- WindowPosition, WindowSize 인터페이스 정의
- IDEWindowState 상태 관리
- 드래그 로직 (setIsDragging, dragOffset)
- 리사이즈 로직 (setIsResizing, resizeDirection)
- localStorage 저장/복원
- 이벤트 핸들러 (마우스/터치)
- 8개 리사이즈 핸들 렌더링
```

**유틸리티 함수**:
- `constrainWindowPosition()`: 창 위치 제약
- `constrainWindowSize()`: 창 크기 제약
- `saveWindowState()`: localStorage에 저장
- `loadWindowState()`: localStorage에서 복원

### 3. **IDEWindowManager.css** (스타일시트)
**경로**: `frontend/src/components/IDEWindowManager.css` (약 450줄)

**주요 스타일**:
```css
- .ide-window: 기본 창 스타일
- .ide-window-titlebar: 제목 표시줄 (40px 높이)
- .ide-window-buttons: 최소화/최대화/닫기 버튼
- .resize-handle: 8개 리사이즈 핸들
- .minimized-icons-bar: 최소화 아이콘 표시줄 (하단 60px)
- .minimized-icon: 최소화된 창 아이콘
- 반응형 디자인 (768px, 480px 브레이크포인트)
```

### 4. **StoryPage.tsx** (통합)
**변경사항**:
```typescript
import IDEWindowManager from '../components/IDEWindowManager';
// ...
<IDEWindowManager />  // JSX에 추가
```

---

## 🎨 UI/UX 디자인

### 제목 표시줄
```
┌──────────────────────────────────────┐
│ [−] [□] [✕]  너굴포트 IDE v2.0     │
└──────────────────────────────────────┘
```

- **색상**: #7D5A44 (동물의 숲 브라운)
- **텍스트**: 화이트, 중앙 정렬
- **버튼**: 왼쪽 정렬, 간격 8px
- **높이**: 40px

### 버튼 스타일
- **호버**: 배경 밝아짐 + 스케일 1.1x
- **클릭**: 배경 더 밝아짐 + 스케일 0.95x
- **닫기 버튼**: 빨간색 (#e74c3c) 호버 효과

### 최소화 표시줄
```
[너굴포트 아이콘] [미션 아이콘]  ← 필요시 추가
```

- **위치**: 화면 하단
- **높이**: 60px
- **배경**: 반투명 검은색 + 그라데이션
- **아이콘 크기**: 48x48px

---

## 💾 상태 관리 (State Management)

### localStorage 저장 구조
```json
{
  "ide_window_state": {
    "isVisible": true,
    "isMinimized": false,
    "isMaximized": false,
    "position": { "x": 50, "y": 50 },
    "size": { "width": 360, "height": 600 },
    "previousPosition": { "x": 50, "y": 50 },
    "previousSize": { "width": 360, "height": 600 }
  }
}
```

### React State
```typescript
- windowState: IDEWindowState
- screenSize: { width, height }
- isDragging: boolean
- dragOffset: { x, y }
- isResizing: boolean
- resizeDirection: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null
- resizeStart: { x, y }
```

---

## 🎯 이벤트 처리 (Event Handling)

### 마우스 이벤트
```typescript
handleTitleBarMouseDown() {
  // 드래그 시작
  // dragOffset 계산
  // isDragging = true
}

handleMouseMove() {
  // 드래그 중: 새로운 위치 계산
  // 리사이즈 중: 새로운 크기 계산
  // constrainWindowPosition(), constrainWindowSize() 적용
}

handleMouseUp() {
  // 드래그/리사이즈 종료
  // isDragging = false, isResizing = false
}
```

### 리사이즈 이벤트
```typescript
handleResizeMouseDown(direction) {
  // 리사이즈 방향 기록
  // resizeStart 좌표 저장
  // isResizing = true
}

handleMouseMove() {
  // 마우스 위치와 resizeStart 비교
  // deltaX, deltaY 계산
  // direction에 따라 width/height 조정
  // 왼쪽/위쪽 리사이즈 시 position도 조정
}
```

### 버튼 클릭 이벤트
```typescript
handleMinimize() {
  // isMinimized 토글
  // 최소화 표시줄에 아이콘 표시
}

handleMaximize() {
  // 이전 상태 저장 (previousPosition, previousSize)
  // position = {0, 0}, size = screenSize
  // isMaximized = true
}

handleClose() {
  // isVisible = false
  // IDE 창 숨김
  // [🚀 IDE] 버튼 표시
}

handleReopen() {
  // isVisible = true
  // IDE 창 다시 표시
}
```

---

## 🔧 기술 구현 상세

### 드래그 로직
```typescript
// 드래그 시작 시
dragOffset = {
  x: e.clientX - windowState.position.x,
  y: e.clientY - windowState.position.y
}

// 드래그 중
newPosition = {
  x: e.clientX - dragOffset.x,
  y: e.clientY - dragOffset.y
}

// 제약 적용
newPosition = constrainWindowPosition(newPosition, windowSize, screenSize)
```

### 리사이즈 로직
```typescript
// 리사이즈 시작
resizeStart = { x: e.clientX, y: e.clientY }

// 리사이즈 중
deltaX = e.clientX - resizeStart.x
deltaY = e.clientY - resizeStart.y

// 방향별 크기 조정
if (direction.includes('e')) newSize.width += deltaX   // 오른쪽
if (direction.includes('w')) newSize.width -= deltaX   // 왼쪽
if (direction.includes('s')) newSize.height += deltaY  // 아래
if (direction.includes('n')) newSize.height -= deltaY  // 위

// 위치 조정 (왼쪽/위 리사이즈 시)
if (direction.includes('w')) newPosition.x += deltaX
if (direction.includes('n')) newPosition.y += deltaY

// 제약 적용
newSize = constrainWindowSize(newSize, screenSize)

// resizeStart 업데이트
resizeStart = { x: e.clientX, y: e.clientY }
```

---

## 📱 반응형 디자인

### 데스크톱 (> 768px)
- 창 크기: 기본값 유지 (360x600px)
- 제목 표시줄 높이: 40px
- 버튼 크기: 28x28px

### 태블릿 (768px 이상)
- 제목 표시줄 높이: 36px
- 버튼 크기: 24x24px
- 폰트 크기: 12px

### 모바일 (480px 이상)
- 제목 표시줄 높이: 32px
- 버튼 크기: 20x20px
- 최소화 표시줄: 52px 높이

---

## ⌨️ 키보드 단축키

| 단축키 | 동작 | 구현 상태 |
|--------|------|---------|
| Alt+M | 최소화/복원 토글 | 📅 향후 추가 |
| Alt+X | 최대화/복원 토글 | 📅 향후 추가 |
| Esc | IDE 닫기 | 📅 향후 추가 |

*현재는 버튼 클릭으로만 가능하며, 향후 `useEffect` 추가로 지원 예정*

---

## 🚀 사용 방법

### StoryPage에서 IDE 사용
1. StoryPage 진입
2. IDE 창이 오른쪽 하단에 자동 표시
3. **드래그**: 제목 표시줄 잡아서 이동
4. **리사이즈**: 모서리/가장자리 드래그
5. **최소화**: [−] 버튼 클릭 → 하단 아이콘으로 축소
6. **최대화**: [□] 버튼 클릭 → 전체 화면으로 확장
7. **닫기**: [✕] 버튼 클릭 → 우측 하단 [🚀 IDE] 버튼으로 재열기

### 로컬스토리지 활용
- 창 위치와 크기가 자동으로 저장됨
- 페이지 새로고침 후에도 이전 상태 복원
- 개발자 도구 → Application → Local Storage에서 확인 가능

---

## 📊 파일 크기 및 성능

| 파일 | 크기 | 라인 수 |
|------|------|--------|
| IDEWindowManager.tsx | ~12KB | 350 |
| IDEWindowManager.css | ~18KB | 450 |
| IDE_EMBED_SPEC.md | ~20KB | 350+ |
| 총합 | ~50KB | 1150+ |

### 성능 최적화
- ✅ `useCallback` 사용으로 함수 재선언 방지
- ✅ `useRef` 사용으로 DOM 노드 직접 접근 최소화
- ✅ 드래그/리사이즈 중 불필요한 리렌더링 방지
- ✅ 500ms 디바운스로 localStorage 저장 빈도 최적화
- ✅ CSS 애니메이션으로 부드러운 시각적 효과

---

## 🔄 향후 추가 예정 기능

### Phase 2
- [ ] 키보드 단축키 지원 (Alt+M, Alt+X, Esc)
- [ ] 터치 이벤트 완전 지원 (모바일)
- [ ] 더블 클릭으로 최대화
- [ ] 창 스냅 기능 (특정 위치에 자동 정렬)

### Phase 3
- [ ] 다중 IDE 창 지원
- [ ] 창 투명도 조절
- [ ] 창 테마 변경 (라이트/다크 모드)
- [ ] 탭 기능 (여러 미션을 탭으로 관리)

### Phase 4
- [ ] 윈도우 12 스타일 디자인
- [ ] 매크로 레코딩
- [ ] 창 배치 프리셋
- [ ] IDE 간 데이터 공유

---

## 🧪 테스트 항목

### 기능 테스트
- [x] 창 드래그 이동
- [x] 창 크기 조절
- [x] 최소화/복원
- [x] 최대화/복원
- [x] 창 닫기/재열기
- [x] 상태 저장/복원
- [ ] 모바일 터치 지원
- [ ] 키보드 단축키

### 엣지 케이스 테스트
- [x] 창이 화면 밖으로 나가지 않음
- [x] 창 최소 크기 유지
- [x] 최대화 상태에서 리사이즈 불가
- [x] 중복 드래그 방지

---

## 📝 코드 구조 요약

### IDEWindowManager.tsx 핵심 부분

```typescript
// 1. 상태 정의
const [windowState, setWindowState] = useState<IDEWindowState>(...)
const [isDragging, setIsDragging] = useState(false)
const [isResizing, setIsResizing] = useState(false)

// 2. 드래그 핸들러
const handleTitleBarMouseDown = useCallback((e) => {
  setIsDragging(true)
  setDragOffset({...})
}, [...])

// 3. 리사이즈 핸들러
const handleResizeMouseDown = useCallback((e, direction) => {
  setIsResizing(true)
  setResizeDirection(direction)
}, [...])

// 4. 마우스 이벤트 리스너
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) { /* 드래그 로직 */ }
    if (isResizing) { /* 리사이즈 로직 */ }
  }
  document.addEventListener('mousemove', handleMouseMove)
  return () => document.removeEventListener('mousemove', handleMouseMove)
}, [isDragging, isResizing, ...])

// 5. 상태 저장
useEffect(() => {
  const timer = setTimeout(() => {
    saveWindowState(windowState)
  }, 500)
  return () => clearTimeout(timer)
}, [windowState])

// 6. 버튼 이벤트
const handleMinimize = () => { /* ... */ }
const handleMaximize = () => { /* ... */ }
const handleClose = () => { /* ... */ }

// 7. 렌더링
return (
  <div className="ide-window" style={{...position, ...size}}>
    <div className="ide-window-titlebar" onMouseDown={...}>
      {/* 제목과 버튼 */}
    </div>
    <div className="ide-window-content">
      <iframe src="/nookphone.html" />
    </div>
    {/* 8개 리사이즈 핸들 */}
  </div>
)
```

---

## ✅ 체크리스트

- [x] IDE_EMBED_SPEC.md 작성
- [x] IDEWindowManager.tsx 구현
- [x] IDEWindowManager.css 작성
- [x] StoryPage 통합
- [x] 드래그 기능 완성
- [x] 리사이즈 기능 완성
- [x] 최소화/최대화 기능 완성
- [x] 상태 저장/복원 기능 완성
- [x] 반응형 디자인
- [ ] 키보드 단축키
- [ ] 모바일 터치 최적화
- [ ] E2E 테스트

---

**작성일**: 2025-12-01
**상태**: ✅ 구현 완료 (키보드 단축키는 향후 추가)
**버전**: 1.0

