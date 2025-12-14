# 너굴 코딩 플랫폼 - 핵심 기술 아키텍처 및 필수 모듈

## 📋 개요

이 문서는 "내 코드가 게임 세상에 영향을 미치는 시뮬레이션"을 구현하기 위해 **선행되거나 병행 개발되어야 할 4가지 핵심 영역**을 정의합니다.

---

## 🎯 핵심 개념: "순환 구조" (The Execution Loop)

```
Student Code (Java)
        ↓
   [Execution Engine]
        ↓
Code Validation & Game Bridge
        ↓
Game State Update (Inventory, Friendship, etc.)
        ↓
Visual Rendering (Dialogue, Map, etc.)
```

이 순환이 **제대로 작동할 때만** 스토리 기획이 의미를 가집니다.

---

## 1️⃣ 코드 실행 및 검증 엔진 (The "Execution" Layer)

### 1.1 개요
현재 IDEWindowManager.tsx는 UI 껍데기일 뿐입니다. 학생이 작성한 Java 코드를 실제로 실행하고, 그 결과를 게임에 반영하는 엔진이 **가장 시급**합니다.

### 1.2 세 가지 핵심 서브모듈

#### 1.2.1 코드 샌드박스 (Code Sandbox)
**목적**: 백엔드에서 학생의 Java 코드를 실행하고 결과를 반환

**선택지별 비교**:

| 선택지 | 장점 | 단점 | 현재 상태 |
|--------|------|------|----------|
| **Java Backend (Process)** | 구현 용이, 즉시 실행 가능 | 보안 취약 (개발 환경용) | **✅ 개발 완료 (JavaExecutionService)** |
| **Docker Isolation** | 완벽한 보안, 환경 격리 | 리소스 소모, 복잡성 | **⏳ 배포 예정 (설계 완료)** |

**Phase 1 구현 현황**: Node.js `child_process` + JDK
- `POST /api/java/validate`: 코드와 메인 클래스를 받아 실행
- `GameBridgeService`: 실행 결과를 게임 상태 로직으로 변환

#### 1.2.2 유효성 검사기 (Code Validator)
**현재 구현**: `MISSION_TESTS` (Scenario-based Validation)
- 정적 분석(AST) 대신, 사전 정의된 **Test Wrapper Class**로 코드를 감싸서 실행
- 결과 문자열("TEST_PASSED")을 파싱하여 성공 여부 판단
- 장점: Java의 복잡한 문법 분석 없이 로직 검증 가능

#### 1.2.3 게임 브릿지 (Game Bridge)
**목적**: 코드 실행 결과(`ExecutionResult`)를 게임 상태 변화(`GameStateUpdate`)로 변환

**구현 완료 (`GameBridgeService.ts`)**:
```typescript
interface GameStateUpdate {
    bellsDelta?: number;
    tileUpdates?: GameTileUpdate[];
    message?: string;
}

// 작동 방식
// 1. Log Parsing: "Removed weed at 3,4" 감지
// 2. State Mapping: mapSlice.setTile(3, 4, grass)
// 3. Economy Mapping: economySlice.addBells(50)
```

---

### 1.3 Phase 1 MVP (최소 기능 제품) 현황

| 항목 | 요구사항 | 상태 |
|------|--------|------------|
| 코드 컴파일/실행 | Java 코드 실행 지원 | ✅ 완료 |
| 유효성 검사 | 테스트 케이스 기반 검증 | ✅ 완료 |
| 게임 브릿지 | Bells, Tile 변경 연동 | ✅ 완료 |
| 월드 렌더링 | TileGridRenderer | ✅ 완료 |


---

## 2️⃣ 게임 상태 관리 시스템 (Game State Management)

### 2.1 개요
기획서의 NookAccount, Villager, Inventory 개념을 실제 웹 애플리케이션의 **전역 상태(State)**로 구현해야 합니다.

### 2.2 상태 관리 라이브러리 선택

| 라이브러리 | 특징 | 추천 레벨 |
|-----------|------|----------|
| **Redux** | 가장 안정적, 큰 커뮤니티, 미들웨어 풍부 | 권장 (프로젝트 규모 중상) |
| **Zustand** | 간단하고 빠름, 코드량 적음 | 초급 |
| **Recoil** | React 친화적, atom 개념 | 중급 |
| **TanStack Query** | 서버 상태 관리에 강함 | 서버 동기화 필요시 |

**Phase 1 권장**: Redux + Redux Toolkit (복잡성 대비 장점 큼)

### 2.3 상태 스키마 정의

```typescript
// frontend/src/store/types.ts

export interface GameState {
  // 플레이어 정보
  nookAccount: {
    username: string;
    level: number;
    totalExperience: number;
  };

  // 경제 시스템
  economy: {
    bells: number;           // 현재 소유금
    loan: number;            // 너굴으로부터의 빚
    loanInterestRate: 0.05;  // 월 5% 이자
    lastInterestDate: Date;
  };

  // 인벤토리 시스템
  inventory: {
    bag: Item[];             // 제한된 슬롯 (20개)
    storage: Item[];         // 무제한 창고
    equipment: Equipment;    // 장비 (낚시대, 손도끼 등)
  };

  // 월드 맵 (2D 배열)
  world: {
    tiles: Tile[][];         // 80x80 그리드
    villagers: VillagerInstance[];
    structures: Structure[];
  };

  // 주민 관계도
  relationships: {
    [villagerId: string]: {
      friendship: number;    // 0~100
      conversations: Dialogue[];
      giftsGiven: Item[];
    };
  };

  // 진행 상황
  progress: {
    completedMissions: string[];
    currentMission: string | null;
    totalPoints: number;
    badges: Badge[];
  };
}
```

### 2.4 서브 시스템

#### 2.4.1 경제 시스템 (Economy Store)
```typescript
// frontend/src/store/slices/economySlice.ts

interface EconomyState {
  bells: number;
  loan: number;
  transactionHistory: Transaction[];
}

// Actions
export const economySlice = createSlice({
  name: 'economy',
  initialState,
  reducers: {
    addBells: (state, action) => {
      state.bells += action.payload;
      state.transactionHistory.push({
        type: 'INCOME',
        amount: action.payload,
        timestamp: new Date()
      });
    },

    applyLoanInterest: (state, action) => {
      // 월별 이자 계산
      state.loan *= 1.05;
    }
  }
});
```

**특징**:
- 정수 오버플로우 방지 (JavaScript는 최대 `2^53 - 1`)
- 거래 히스토리 기록
- 이자 계산 시뮬레이션

#### 2.4.2 인벤토리 시스템 (Inventory Store)
```typescript
// frontend/src/store/slices/inventorySlice.ts

interface InventoryState {
  bag: Item[];        // 고정 슬롯 (배열)
  storage: Item[];    // 가변 리스트 (ArrayList 역할)
}

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    bag: new Array(20).fill(null),     // 20 크기 배열
    storage: []                          // 동적 배열
  },
  reducers: {
    addToBag: (state, action) => {
      const emptySlot = state.bag.findIndex(item => item === null);
      if (emptySlot === -1) {
        // 가방이 가득 참 → 창고에 저장
        state.storage.push(action.payload);
      } else {
        state.bag[emptySlot] = action.payload;
      }
    },

    addToStorage: (state, action) => {
      state.storage.push(action.payload);
    }
  }
});
```

**디자인 의도**:
- `bag[]`: 고정 크기 배열 (Unit 7 "배열" 학습)
- `storage[]`: 가변 크기 리스트 (Unit 8 "ArrayList" 학습)
- 학생들이 코드로 구분되는 두 자료구조를 직접 경험

#### 2.4.3 월드 맵 데이터 (World Grid Store)
```typescript
// frontend/src/store/slices/worldSlice.ts

enum TileType {
  GRASS = 0,
  WATER = 1,
  WEEDS = 2,
  TILLED = 3,
  PATH = 4
}

interface Tile {
  type: TileType;
  x: number;
  y: number;
}

interface WorldState {
  tiles: Tile[][];       // 80x80 grid
  width: number;
  height: number;
}

export const worldSlice = createSlice({
  name: 'world',
  initialState: {
    width: 80,
    height: 80,
    tiles: initializeTiles(80, 80)
  },
  reducers: {
    removeTile: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      if (state.tiles[y] && state.tiles[y][x]) {
        state.tiles[y][x].type = TileType.GRASS;
      }
    },

    plantTile: (state, action) => {
      const { x, y, type } = action.payload;
      state.tiles[y][x].type = type;
    }
  }
});
```

---

## 3️⃣ 핵심 게임 메커니즘 (Game Mechanics Implementation)

### 3.1 개요
스토리를 얹기 위한 '무대 장치'들입니다. 이 기능들이 코드로 구현되어 있어야 스토리가 동작합니다.

### 3.2 필수 컴포넌트 4가지

#### 3.2.1 타일 그리드 렌더러 (Grid Renderer)
**목적**: 2D 배열 데이터를 화면에 격자무늬 지도로 렌더링

```typescript
// frontend/src/components/TileGridRenderer.tsx
import React from 'react';
import { useSelector } from 'react-redux';

export const TileGridRenderer: React.FC = () => {
  const tiles = useSelector(state => state.world.tiles);
  const TILE_SIZE = 32; // 픽셀

  const getTileColor = (tileType: TileType): string => {
    switch (tileType) {
      case TileType.GRASS: return '#90EE90';
      case TileType.WATER: return '#4A90E2';
      case TileType.WEEDS: return '#FFB347';
      case TileType.TILLED: return '#8B7355';
      case TileType.PATH: return '#D3D3D3';
      default: return '#FFF';
    }
  };

  return (
    <div className="tile-grid">
      {tiles.map((row, y) =>
        row.map((tile, x) => (
          <div
            key={`${x}-${y}`}
            className="tile"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: getTileColor(tile.type),
              border: '1px solid #ccc'
            }}
          />
        ))
      )}
    </div>
  );
};
```

**Unit 8 활용**:
- 학생이 작성한 코드: `for(int r=0; r<tiles.length; r++)` → 직접 지도 변경
- 시각적 피드백 즉시 표시

#### 3.2.2 대화 시스템 (Dialogue System)
**목적**: JSON 데이터를 읽어 캐릭터 이미지와 텍스트를 순차적으로 표시

```typescript
// frontend/src/components/DialogueOverlay.tsx
import React, { useState, useEffect } from 'react';
import dialogueData from './data/dialogues.json';

export const DialogueOverlay: React.FC<{ dialogueId: string }> = ({ dialogueId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogue = dialogueData[dialogueId];
  const current = dialogue[currentIndex];

  useEffect(() => {
    // 한 글자씩 타이핑 효과
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < current.text.length) {
        charIndex++;
        setDisplayedText(current.text.slice(0, charIndex));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="dialogue-box">
      <img src={current.characterImage} />
      <div className="dialogue-text">{displayedText}</div>
      <button onClick={() => setCurrentIndex(prev => prev + 1)}>
        {currentIndex < dialogue.length - 1 ? 'Next' : 'End'}
      </button>
    </div>
  );
};
```

**Data Format (isabelle-control-flow.json)**:
```json
{
  "id": "isabelle_welcome",
  "dialogues": [
    {
      "characterId": "isabelle",
      "characterImage": "/assets/isabelle.png",
      "text": "Welcome to the island!"
    },
    {
      "characterId": "isabelle",
      "text": "I'm excited to see what you'll create with code!"
    }
  ]
}
```

#### 3.2.3 시간/날씨 시스템 (Environment System)
**목적**: 게임 내 시간(아침/점심/저녁)과 날씨 상태 변경

```typescript
// frontend/src/store/slices/environmentSlice.ts

enum TimeOfDay {
  MORNING = 'morning',     // 06:00 - 12:00
  AFTERNOON = 'afternoon', // 12:00 - 18:00
  EVENING = 'evening'      // 18:00 - 06:00
}

enum WeatherType {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy'
}

interface EnvironmentState {
  currentTime: TimeOfDay;
  currentWeather: WeatherType;
  gameMinutesElapsed: number;  // 게임 내 시간
}

export const environmentSlice = createSlice({
  name: 'environment',
  initialState: {
    currentTime: TimeOfDay.MORNING,
    currentWeather: WeatherType.SUNNY,
    gameMinutesElapsed: 0
  },
  reducers: {
    advanceTime: (state) => {
      state.gameMinutesElapsed += 1;

      // 매 360분(게임 내 6시간)마다 시간대 변경
      const period = state.gameMinutesElapsed / 360;
      if (period < 1) state.currentTime = TimeOfDay.MORNING;
      else if (period < 2) state.currentTime = TimeOfDay.AFTERNOON;
      else state.currentTime = TimeOfDay.EVENING;
    },

    changeWeather: (state, action) => {
      state.currentWeather = action.payload;
    }
  }
});
```

**Unit 3 활용 (Dog Walker Problem)**:
- 아침에만 개를 산책시킬 수 있음
- 코드 실행 후: `if(time == MORNING) { walk(); }`

#### 3.2.4 미션 실행 오케스트레이터 (Mission Executor)
```typescript
// frontend/src/services/MissionExecutor.ts

export async function executeMission(
  missionId: string,
  studentCode: string
): Promise<MissionResult> {
  // 1. 백엔드에 코드 실행 요청
  const executionResult = await executeCode(studentCode);

  // 2. 검증
  const isValid = await validateCode(studentCode, missionId);

  // 3. 게임 상태 업데이트
  if (isValid) {
    const updates = await bridgeCodeToGame(executionResult, missionId);
    dispatch(applyGameStateUpdates(updates));
  }

  // 4. 진행도 업데이트
  dispatch(updateMissionProgress({
    missionId,
    success: isValid,
    points: isValid ? calculatePoints(studentCode) : 0
  }));

  // 5. UI에 결과 전달
  return {
    success: isValid,
    output: executionResult.output,
    feedback: generateFeedback(isValid, executionResult)
  };
}
```

---

## 4️⃣ 콘텐츠 데이터 구조화 (Schema Design)

### 4.1 개요
단순 텍스트가 아닌 **실행 가능하고 검증 가능한** 데이터 구조 필요

### 4.2 종합 스키마

```typescript
// frontend/src/types/Content.ts

export interface Mission {
  // 기본 정보
  id: string;
  title: string;
  description: string;
  unitNumber: number;
  difficulty: 'easy' | 'medium' | 'hard';

  // 학습 목표
  learningObjectives: string[];
  conceptsFocused: string[];  // ['array', '2d-array', 'loop']

  // 코드 실행 설정
  execution: {
    language: 'java' | 'javascript';
    mainMethod: string;        // 실행할 메서드명
    timeout: number;           // 초 단위
  };

  // 성공 조건 (검증)
  successCondition: {
    type: 'output_match' | 'code_structure' | 'hybrid';
    testCases: TestCase[];

    // 선택: 정적 분석 규칙
    codeStructureRules?: CodeRule[];
  };

  // 게임 이벤트 (코드 결과 → 게임 상태)
  gameEvents: GameEvent[];

  // 피드백
  feedback: {
    success: string;           // 성공시 메시지
    hints: string[];           // 실패시 힌트 (점진적 공개)
    errorMessages: {           // 특정 오류별 메시지
      [errorType: string]: string;
    };
  };
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description: string;  // 선택사항: 학생에게 표시할 설명
}

export interface CodeRule {
  name: string;
  description: string;
  validator: (ast: AST) => boolean;

  // 예: "for 루프 사용"
  // validator: (ast) => hasNodeType(ast, 'ForStatement')
}

export interface GameEvent {
  trigger: 'on_success' | 'on_specific_output' | 'always';
  condition?: string;  // outputValue === 100 같은 조건
  actions: GameAction[];
}

export interface GameAction {
  type: 'modify_inventory' | 'update_friendship' | 'show_dialogue' | 'update_map' | 'add_bells';
  payload: any;
}

export interface Dialogue {
  id: string;
  triggeredBy?: string;        // 미션 ID 등
  character: string;           // 'isabelle', 'tom-nook' 등
  lines: DialogueLine[];
  choices?: DialogueChoice[];   // 선택지 (다중 엔딩)
}

export interface DialogueLine {
  character: string;
  text: string;
  emotion?: 'happy' | 'sad' | 'angry' | 'neutral';
}

export interface DialogueChoice {
  text: string;
  consequenceDialogueId?: string;
  consequenceGameEvent?: GameEvent;
}
```

### 4.3 예시: 실제 미션 JSON

```json
{
  "id": "m_07_2d_array_terraforming",
  "title": "섬 테라포밍 프로젝트",
  "description": "2D 배열을 사용하여 섬의 지형을 설계하세요",
  "unitNumber": 8,
  "difficulty": "medium",
  "learningObjectives": [
    "2D 배열 선언 및 초기화",
    "중첩 루프를 이용한 배열 순회",
    "조건문을 활용한 데이터 처리"
  ],

  "execution": {
    "language": "javascript",
    "mainMethod": "terraformIsland",
    "timeout": 5
  },

  "successCondition": {
    "type": "hybrid",
    "testCases": [
      {
        "input": [],
        "expectedOutput": {
          "waterTiles": 24,
          "grassTiles": 56
        },
        "description": "40x40 그리드에서 정확한 타일 배치"
      }
    ],
    "codeStructureRules": [
      {
        "name": "nested_loop",
        "description": "중첩 for 루프 사용",
        "validator": "hasNestedForLoop"
      },
      {
        "name": "2d_array_init",
        "description": "2D 배열 초기화",
        "validator": "hasTwoDimensionalArray"
      }
    ]
  },

  "gameEvents": [
    {
      "trigger": "on_success",
      "actions": [
        {
          "type": "update_map",
          "payload": {
            "newTiles": "student_code_result"
          }
        },
        {
          "type": "show_dialogue",
          "payload": {
            "dialogueId": "isabelle_terraforming_success"
          }
        },
        {
          "type": "add_bells",
          "payload": {
            "amount": 5000
          }
        }
      ]
    }
  ],

  "feedback": {
    "success": "완벽합니다! 당신의 섬이 멋진 지형으로 변했어요!",
    "hints": [
      "힌트 1: 이중 for 루프를 사용하여 80x80 그리드를 순회해보세요",
      "힌트 2: 각 타일의 (x, y) 위치에 따라 다른 타일 타입을 설정하세요",
      "힌트 3: 물은 모서리 부분에, 잔디는 중앙에 배치하면 어떨까요?"
    ],
    "errorMessages": {
      "timeout": "코드 실행이 너무 오래 걸렸어요. 무한 루프가 없는지 확인하세요.",
      "syntax_error": "Java 문법 오류를 확인하세요.",
      "output_mismatch": "예상과 다른 결과가 나왔어요. 다시 확인해보세요."
    }
  }
}
```

---

## 📊 구현 우선순위 및 일정

### Phase 1 (Week 1-2): 기초 인프라
- [x] 프론트엔드 기본 구조 (IDEWindow)
- [ ] 백엔드 코드 실행 API
- [ ] 기본 게임 상태 (Redux 초기화)
- [ ] 간단한 게임 브릿지 (Bells만)

### Phase 2 (Week 3-4): 게임 시스템 확충
- [ ] TileGridRenderer
- [ ] DialogueOverlay
- [ ] EnvironmentSystem
- [ ] 정적 분석 기초

### Phase 3 (Week 5+): 완전 통합
- [ ] 모든 게임 메커니즘 통합
- [ ] 풀 스토리라인
- [ ] 고급 검증 (정적 분석)

---

## 🎯 성공 지표

| 지표 | 목표 | 확인 방법 |
|------|------|---------|
| 코드 실행 성공률 | 100% | 백엔드 테스트 |
| 게임 상태 동기화 | 100% | E2E 테스트 |
| 학생 만족도 | 4.5/5 이상 | 사용자 피드백 |
| 로드 시간 | < 3초 | 성능 프로파일링 |

