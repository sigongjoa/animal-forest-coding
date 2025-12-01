# 너굴포트 IDE 임베드 및 창 관리 기술 사양서

## 1. 개요

StoryPage 내에 너굴포트 IDE를 임베드하면서도, 전체 화면으로 확장하거나 최소화할 수 있는 Windows 스타일의 창 관리 시스템 구현

## 2. 핵심 기능

### 2.1 IDE 임베드 뷰 (StoryPage 내)
- **기본 상태**: StoryPage 하단에 작은 IDE 창으로 표시
- **크기**: 너굴폰 원본 크기 (360x600px)
- **위치**: 오른쪽 하단 또는 드래그 가능한 위치
- **기능**:
  - 미니 뷰에서도 코드 작성 및 실행 가능
  - 너굴 피드백 표시
  - 포인트/배지 획득

### 2.2 IDE 창 관리 (Window Manager)

#### 2.2.1 최소화 (Minimize)
- 액션: 윈도우 제목 표시줄의 최소화 버튼 클릭
- 동작: IDE 창이 작은 아이콘으로 축소
- 표시: 화면 하단 또는 측면에 미니 아이콘
- 복원: 아이콘 클릭 시 원래 크기로 복원

#### 2.2.2 최대화 (Maximize)
- 액션: 제목 표시줄의 최대화 버튼 클릭
- 동작: IDE가 전체 화면(또는 거의 전체)으로 확장
- 상태: 최대화 상태에서 StoryPage 콘텐츠 숨김
- 복원: 최대화 해제 버튼으로 원래 크기로 돌아감

#### 2.2.3 창 닫기 (Close)
- 액션: 제목 표시줄의 X 버튼 클릭
- 동작: IDE 창 닫음
- 저장: 코드 및 상태는 localStorage에 자동 저장
- 재열기: 같은 미션 진입 시 이전 상태 복원

#### 2.2.4 창 이동 (Drag & Move)
- 액션: 제목 표시줄을 마우스로 드래그
- 동작: 창이 화면 내에서 자유롭게 이동
- 제약: 창이 화면 밖으로 나가지 않도록 제한
- 미니화 상태: 이동 불가

#### 2.2.5 창 크기 조절 (Resize)
- 액션: 창의 모서리/코너를 드래그
- 동작: 창의 너비/높이 조절
- 최소 크기: 너굴폰 최소 권장 크기 (300x500px)
- 최대 크기: 화면 크기에 맞춤

## 3. UI 구조

### 3.1 IDE 창 컴포넌트 구조

```
┌─────────────────────────────────────┐
│  [─] [🔲] [✕]  너굴포트 IDE v2.0  │ ← 제목 표시줄 (Draggable)
├─────────────────────────────────────┤
│                                     │
│    너굴포트 IDE 콘텐츠             │ ← NookPhone UI
│  (미션, 에디터, 진행도 탭)         │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ ↗ 화면 모서리 (Resize Handle)      │ ← 크기 조절 영역
└─────────────────────────────────────┘
```

### 3.2 제목 표시줄 (Title Bar)
- 높이: 40px
- 배경색: #7D5A44 (동물의 숲 브라운)
- 텍스트: "너굴포트 IDE v2.0" (화이트, 중앙)
- 버튼들:
  - [−] 최소화 (15x15px)
  - [□] 최대화/복원 (15x15px)
  - [✕] 닫기 (15x15px)
  - 오른쪽 정렬, 간격 5px

### 3.3 최소화 아이콘 표시줄 (Minimized Icons Bar)
- 위치: 화면 하단 (z-index 매우 높음)
- 높이: 50px
- 배경색: rgba(0,0,0,0.7)
- 아이콘: 30x40px 썸네일
- 호버 시: 창 이름 툴팁 표시

## 4. 상태 관리

### 4.1 IDE 윈도우 상태
```typescript
interface IDEWindowState {
  isVisible: boolean;          // 창 표시 여부
  isMinimized: boolean;        // 최소화 상태
  isMaximized: boolean;        // 최대화 상태

  // 일반 상태 위치/크기
  position: { x: number; y: number };
  size: { width: number; height: number };

  // 최대화 전 위치/크기 저장
  previousPosition: { x: number; y: number };
  previousSize: { width: number; height: number };

  // IDE 내부 상태
  currentMission: string | null;
  codeContent: string;
  selectedTab: 'missions' | 'editor' | 'progress';

  // 자동 저장
  lastSaved: number;
}
```

### 4.2 localStorage 저장 구조
```json
{
  "nookphone_ide_state": {
    "position": { "x": 100, "y": 200 },
    "size": { "width": 360, "height": 600 },
    "isMinimized": false,
    "isMaximized": false,
    "currentMission": "variables_001",
    "codeContent": "...",
    "selectedTab": "editor"
  }
}
```

## 5. 컴포넌트 구현 계획

### 5.1 새로운 컴포넌트
1. **IDEWindowManager** (상위 컨테이너)
   - 전체 창 관리 로직
   - 상태 관리 (useState)
   - 드래그/리사이즈 핸들러

2. **IDEWindowFrame** (창 틀)
   - 제목 표시줄 렌더링
   - 버튼 이벤트 처리
   - 드래그 영역 정의

3. **IDEWindowContent** (콘텐츠)
   - NookPhone IDE UI 임베드
   - 미션/에디터/진행도 탭

4. **IDEMinimizedBar** (최소화 표시줄)
   - 최소화된 창 목록
   - 아이콘 렌더링
   - 복원 클릭 핸들러

### 5.2 유틸리티 함수
```typescript
// 창 위치 제약 (화면 밖으로 나가지 않도록)
function constrainWindowPosition(
  position: {x: number, y: number},
  windowSize: {width: number, height: number},
  screenSize: {width: number, height: number}
): {x: number, y: number}

// 드래그 이벤트 처리
function handleWindowDrag(
  e: MouseEvent,
  startPos: {x: number, y: number},
  startOffset: {x: number, y: number}
): {x: number, y: number}

// 리사이즈 처리
function handleWindowResize(
  e: MouseEvent,
  startSize: {width: number, height: number},
  direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
): {width: number, height: number}

// 상태 저장/복원
function saveIDEState(state: IDEWindowState): void
function loadIDEState(): IDEWindowState | null
```

## 6. 스타일 (Tailwind CSS)

### 6.1 창 스타일
```css
/* IDE 창 프레임 */
.ide-window {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  z-index: 1000;

  user-select: none; /* 드래그 중 텍스트 선택 방지 */
}

/* 제목 표시줄 */
.ide-window-titlebar {
  height: 40px;
  background: #7D5A44;
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  cursor: grab;
  user-select: none;
}

.ide-window-titlebar:active {
  cursor: grabbing;
}

/* 버튼 */
.ide-window-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.ide-window-btn:hover {
  background: rgba(255,255,255,0.2);
}

.ide-window-btn:active {
  background: rgba(255,255,255,0.3);
}

/* 리사이즈 핸들 */
.ide-window-resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

/* 최소화 표시줄 */
.minimized-icons-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(0,0,0,0.7);
  display: flex;
  gap: 8px;
  padding: 8px;
  z-index: 999;
}

.minimized-icon {
  width: 30px;
  height: 40px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid #7D5A44;
}
```

## 7. 이벤트 처리

### 7.1 마우스 이벤트
- **onMouseDown** (제목 표시줄): 드래그 시작
- **onMouseMove** (document): 드래그/리사이즈 진행
- **onMouseUp** (document): 드래그/리사이즈 종료

### 7.2 터치 이벤트 (모바일 지원)
- **onTouchStart**: 터치 드래그 시작
- **onTouchMove**: 터치 드래그 진행
- **onTouchEnd**: 터치 드래그 종료

### 7.3 키보드 이벤트
- **Escape**: IDE 창 닫기
- **Alt+M**: 최소화/복원 토글
- **Alt+X**: IDE 최대화/복원

## 8. 구현 순서

1. **Phase 1**: IDEWindowManager 기본 구조
   - 상태 관리
   - 위치/크기 관리
   - localStorage 저장/복원

2. **Phase 2**: 드래그 기능
   - 제목 표시줄 드래그
   - 위치 제약 로직
   - 시각적 피드백

3. **Phase 3**: 리사이즈 기능
   - 모서리 리사이즈 핸들
   - 8방향 리사이즈
   - 최소/최대 크기 제약

4. **Phase 4**: 최소화/최대화
   - 최소화 버튼 로직
   - 최소화 표시줄
   - 최대화/복원 기능

5. **Phase 5**: StoryPage 통합
   - IDEWindowManager를 StoryPage에 추가
   - 스토리 텍스트와 IDE 창 겹침 처리
   - 스타일 조정

6. **Phase 6**: 테스트 및 최적화
   - E2E 테스트 작성
   - 성능 최적화
   - 모바일 반응형 테스트

## 9. 예상 파일 구조

```
frontend/src/
├── components/
│   ├── IDEWindowManager.tsx       (메인 창 관리)
│   ├── IDEWindowFrame.tsx         (창 틀)
│   ├── IDEWindowContent.tsx       (콘텐츠)
│   ├── IDEMinimizedBar.tsx        (최소화 표시줄)
│   └── IDEWindowManager.css       (스타일)
└── pages/
    └── StoryPage.tsx              (통합)
```

## 10. 성능 고려사항

- 드래그/리사이즈 시 requestAnimationFrame 사용
- 불필요한 리렌더링 최소화 (useMemo, useCallback)
- localStorage 저장은 디바운스 (500ms)
- z-index 레이어 관리

## 11. 접근성

- 키보드 네비게이션 지원
- ARIA 레이블 추가
- 포커스 관리
- 스크린 리더 지원

---

**작성일**: 2025-12-01
**버전**: 1.0
**상태**: 구현 준비 완료
