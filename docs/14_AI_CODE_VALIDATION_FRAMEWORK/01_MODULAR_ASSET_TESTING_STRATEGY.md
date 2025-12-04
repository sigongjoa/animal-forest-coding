# 📦 모듈형 에셋 시스템 테스트 전략

**작성일**: 2025-12-04
**대상**: 프론트엔드 엔지니어, 디자이너, QA 엔지니어

---

## 📋 목차

1. [전략 개요](#전략-개요)
2. [Stage 1: Code Level 테스트](#stage-1-code-level-테스트)
3. [Stage 2: System Level 테스트](#stage-2-system-level-테스트)
4. [Stage 3: Advanced Logic 테스트](#stage-3-advanced-logic-테스트)
5. [Stage 4: Product Level 테스트](#stage-4-product-level-테스트)
6. [Stage 5-7: DevOps/Ops 테스트](#stage-5-7-devopsops-테스트)
7. [DoD (Definition of Done)](#dod-definition-of-done)

---

## 🎯 전략 개요

### 모듈형 에셋 시스템이란?

```
기존 방식 (Full Illustration):
에피소드 1: 21개 완전한 일러스트
에피소드 2: 21개 완전한 일러스트 (새로 제작)
에피소드 3: 21개 완전한 일러스트 (새로 제작)
          ↓
총 63개 일러스트 필요 (시간 낭비)

제안 (Modular System):
초기 에셋: 21개 (배경 5 + 캐릭터 8 + UI 8)
          ↓
에피소드 1-4: 이 21개를 다양하게 조합
          ↓
총 21개 에셋으로 모든 에피소드 표현
```

### 핵심 컴포넌트

```
AssetManager
├─ Asset 로드 (DB에서)
├─ 캐싱 (메모리)
└─ 성능 최적화

    ↓

SceneComposer
├─ 레이어 조합
├─ Z-index 관리
└─ Canvas 렌더링

    ↓

ScenePlayer
├─ 애니메이션 재생
├─ 사용자 상호작용
└─ 상태 관리
```

---

## 🧪 Stage 1: Code Level 테스트

**목표**: 각 클래스와 함수가 독립적으로 정상 작동하는가?

### 1.1 AssetManager 단위 테스트

#### 테스트 케이스 1.1.1: Asset 로드 성공

```javascript
describe('AssetManager - loadAsset', () => {
  let assetManager;

  beforeEach(() => {
    assetManager = new AssetManager();
  });

  test('should load asset successfully', async () => {
    const asset = await assetManager.loadAsset('background_beach');

    expect(asset).toBeDefined();
    expect(asset.id).toBe('background_beach');
    expect(asset.type).toBe('background');
    expect(asset.data).toBeDefined(); // Image data
  });
});
```

**검증 항목**:
- ✅ Asset 객체 반환
- ✅ 올바른 id
- ✅ 올바른 type
- ✅ Image data 존재

---

#### 테스트 케이스 1.1.2: Asset 캐싱

```javascript
test('should cache asset on second load', async () => {
  // 첫 번째 로드 (DB에서)
  const loadStart1 = performance.now();
  const asset1 = await assetManager.loadAsset('background_beach');
  const loadTime1 = performance.now() - loadStart1;

  // 두 번째 로드 (캐시에서)
  const loadStart2 = performance.now();
  const asset2 = await assetManager.loadAsset('background_beach');
  const loadTime2 = performance.now() - loadStart2;

  // 검증
  expect(asset1).toBe(asset2); // 같은 객체
  expect(loadTime2).toBeLessThan(loadTime1 * 0.1); // 10배 이상 빠름
  expect(assetManager.getCacheSize()).toBe(1);
});
```

**검증 항목**:
- ✅ 캐시에서 같은 객체 반환
- ✅ 두 번째 로드가 훨씬 빠름
- ✅ 캐시 크기 증가

---

#### 테스트 케이스 1.1.3: Asset 없음 (Error handling)

```javascript
test('should throw error for non-existent asset', async () => {
  try {
    await assetManager.loadAsset('nonexistent_asset');
    fail('Should have thrown error');
  } catch (error) {
    expect(error.message).toContain('Asset not found');
    expect(error.code).toBe('ASSET_NOT_FOUND');
  }
});
```

**검증 항목**:
- ✅ 에러 발생
- ✅ 올바른 에러 메시지
- ✅ 올바른 에러 코드

---

#### 테스트 케이스 1.1.4: Asset 메타데이터

```javascript
test('should include asset metadata', async () => {
  const asset = await assetManager.loadAsset('nook_happy');

  expect(asset.metadata).toBeDefined();
  expect(asset.metadata.width).toBe(256);
  expect(asset.metadata.height).toBe(256);
  expect(asset.metadata.format).toBe('png');
  expect(asset.metadata.layers).toBeDefined();
  expect(Array.isArray(asset.metadata.layers)).toBe(true);
});
```

**검증 항목**:
- ✅ 메타데이터 존재
- ✅ 올바른 크기 (256x256)
- ✅ 올바른 포맷 (png)
- ✅ 레이어 정보

---

### 1.2 SceneComposer 단위 테스트

#### 테스트 케이스 1.2.1: Scene 구성 기본

```javascript
describe('SceneComposer - composeScene', () => {
  let composer;

  beforeEach(() => {
    const manager = new AssetManager();
    composer = new SceneComposer(manager);
  });

  test('should compose scene with basic layers', async () => {
    const sceneJson = {
      background: 'beach.png',
      characters: [
        { asset: 'nook_happy.png', x: 100, y: 200 },
        { asset: 'player_standing.png', x: 300, y: 200 }
      ]
    };

    const scene = await composer.composeScene(sceneJson);

    expect(scene).toBeDefined();
    expect(scene.layers).toHaveLength(3); // bg + 2 chars
    expect(scene.layers[0].type).toBe('background');
    expect(scene.layers[1].type).toBe('character');
    expect(scene.layers[2].type).toBe('character');
  });
});
```

**검증 항목**:
- ✅ Scene 객체 생성
- ✅ 올바른 레이어 수
- ✅ 올바른 레이어 타입

---

#### 테스트 케이스 1.2.2: Z-index 자동 정렬

```javascript
test('should automatically set z-index based on layer type', async () => {
  const sceneJson = {
    background: 'beach.png',
    ui: { asset: 'dialog_box.png', x: 50, y: 400 },
    characters: [
      { asset: 'nook_happy.png', x: 100, y: 200 }
    ]
  };

  const scene = await composer.composeScene(sceneJson);
  const sorted = scene.layers.sort((a, b) => a.zIndex - b.zIndex);

  // 순서: background < character < ui
  expect(sorted[0].type).toBe('background');
  expect(sorted[1].type).toBe('character');
  expect(sorted[2].type).toBe('ui');

  // z-index 값 증가
  expect(sorted[0].zIndex).toBeLessThan(sorted[1].zIndex);
  expect(sorted[1].zIndex).toBeLessThan(sorted[2].zIndex);
});
```

**검증 항목**:
- ✅ Background가 맨 아래
- ✅ Character가 중간
- ✅ UI가 맨 위

---

#### 테스트 케이스 1.2.3: Scene 유효성 검사

```javascript
test('should validate scene before composition', async () => {
  const invalidSceneJson = {
    // background 없음!
    characters: []
  };

  try {
    await composer.composeScene(invalidSceneJson);
    fail('Should have thrown error');
  } catch (error) {
    expect(error.message).toContain('background is required');
  }
});
```

**검증 항목**:
- ✅ 필수 필드 검사
- ✅ 유효하지 않은 데이터 거부

---

### 1.3 정적 분석 (Static Analysis)

```bash
# TypeScript 타입 체크
tsc --noEmit

# ESLint 코드 스타일
eslint src/components/AssetManager.ts
eslint src/components/SceneComposer.ts
eslint src/components/ScenePlayer.ts

# 보안 취약점
npm audit

# 복잡도 분석
npx complexity-report src/components/**/*.ts
```

**기준**:
- ✅ TypeScript 오류: 0개
- ✅ ESLint 심각도: 0개 Critical
- ✅ npm audit: 0개 Moderate/High
- ✅ Cyclomatic Complexity: < 15

---

## 🎮 Stage 2: System Level 테스트

**목표**: 전체 에셋 시스템이 실제 웹 환경에서 작동하는가?

### 2.1 E2E 테스트 - Asset 렌더링

#### 테스트 케이스 2.1.1: 기본 장면 렌더링

```javascript
describe('Asset System E2E - Story Page', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000/story');
  });

  test('should render beach scene with correct assets', async () => {
    // 1. 페이지 로드
    await page.waitForSelector('.story-canvas');

    // 2. 배경 이미지 확인
    const canvas = await page.$('.story-canvas');
    expect(canvas).toBeDefined();

    // 3. 렌더링된 이미지 개수 확인
    const images = await page.$$eval(
      '.story-canvas img',
      imgs => imgs.length
    );
    expect(images).toBeGreaterThan(0);

    // 4. 특정 에셋이 있는지 확인
    const hasNook = await page.$(
      'img[src*="nook_happy"]'
    );
    expect(hasNook).toBeDefined();
  });
});
```

**검증 항목**:
- ✅ Canvas 렌더링
- ✅ 이미지 로드 완료
- ✅ 예상된 에셋 표시

---

#### 테스트 케이스 2.1.2: 레이어 순서 검증 (Visual)

```javascript
test('should render layers in correct z-order', async () => {
  // Canvas에서 pixel 데이터 확인
  const canvas = await page.$('canvas');
  const canvasHandle = await canvas.evaluateHandle(c => c);

  const pixelData = await page.evaluate((canvasHandle) => {
    const canvas = canvasHandle;
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  }, canvasHandle);

  // 검증: 배경이 최소한 일부를 차지해야 함
  const pixelCount = pixelData.filter((val, i) => i % 4 === 3).filter(a => a > 0).length;
  expect(pixelCount).toBeGreaterThan(0);
});
```

**검증 항목**:
- ✅ Canvas에 픽셀 데이터
- ✅ 이미지가 렌더링됨

---

### 2.2 성능 테스트

#### 테스트 케이스 2.2.1: 에셋 로딩 시간

```javascript
describe('Performance - Asset Loading', () => {
  test('assets should load within 2 seconds', async () => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/story');
    await page.waitForSelector('.story-canvas');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // 2초 이내
  });

  test('scene composition should complete within 500ms', async () => {
    const startTime = Date.now();

    // Scene 변경 (다음 장면으로)
    await page.click('.next-button');
    await page.waitForSelector('.story-canvas.updated');

    const composeTime = Date.now() - startTime;

    expect(composeTime).toBeLessThan(500); // 500ms 이내
  });
});
```

**검증 항목**:
- ✅ 초기 로드: < 2초
- ✅ Scene 변경: < 500ms
- ✅ 부드러운 전환

---

#### 테스트 케이스 2.2.2: 메모리 사용량

```javascript
test('asset system should not leak memory', async () => {
  const metrics1 = await page.evaluate(() => {
    return {
      memory: performance.memory.usedJSHeapSize,
      assets: window.__assetManager?.getCacheSize?.()
    };
  });

  // 10번 Scene 변경
  for (let i = 0; i < 10; i++) {
    await page.click('.next-button');
    await page.waitForSelector('.story-canvas.updated');
  }

  const metrics2 = await page.evaluate(() => {
    return {
      memory: performance.memory.usedJSHeapSize,
      assets: window.__assetManager?.getCacheSize?.()
    };
  });

  // 메모리 증가가 40MB 이하 (캐시는 동일해야 함)
  const memoryIncrease = (metrics2.memory - metrics1.memory) / 1024 / 1024;
  expect(memoryIncrease).toBeLessThan(40); // 40MB
});
```

**검증 항목**:
- ✅ 메모리 누수 없음
- ✅ 캐시 효율적 재사용

---

### 2.3 보안 테스트

#### 테스트 케이스 2.3.1: XSS 방지 (Asset URL)

```javascript
describe('Security - XSS Prevention', () => {
  test('should sanitize asset URLs', async () => {
    const maliciousUrl = 'javascript:alert("xss")';

    try {
      const scene = await composer.composeScene({
        background: maliciousUrl,
        characters: []
      });

      // 이 코드에 도달해서는 안 됨
      fail('Should have rejected malicious URL');
    } catch (error) {
      expect(error.message).toContain('Invalid asset URL');
    }
  });

  test('should only load from whitelist domains', async () => {
    const externalUrl = 'https://malicious.com/asset.png';

    try {
      const asset = await assetManager.loadAsset(externalUrl);
      fail('Should have rejected external domain');
    } catch (error) {
      expect(error.message).toContain('domain not whitelisted');
    }
  });
});
```

**검증 항목**:
- ✅ XSS 공격 차단
- ✅ 화이트리스트만 허용

---

#### 테스트 케이스 2.3.2: CSRF 방지

```javascript
test('asset loading should include CSRF token', async () => {
  const requests = [];

  page.on('request', req => {
    if (req.url().includes('/api/assets')) {
      requests.push(req);
    }
  });

  await page.goto('http://localhost:3000/story');

  // 모든 API 요청에 CSRF 토큰이 있는가?
  requests.forEach(req => {
    const csrfToken = req.headers()['x-csrf-token'];
    expect(csrfToken).toBeDefined();
  });
});
```

**검증 항목**:
- ✅ CSRF 토큰 포함
- ✅ 토큰 검증

---

### 2.4 부하 테스트

```bash
# 1000명 동시 Asset 요청
autocannon -c 1000 -d 60 \
  -p /api/assets/batch \
  http://localhost:5000

# 기준
응답 시간 (p95): < 2초
에러율: < 1%
```

**검증 항목**:
- ✅ 1000 동시 연결 처리
- ✅ 응답 시간 유지
- ✅ 에러율 낮음

---

## 🎯 Stage 3: Advanced Logic 테스트

**목표**: 복잡한 시나리오에서도 항상 올바른가?

### 3.1 속성 기반 테스트 (Property-Based Testing)

```javascript
describe('Property-Based Testing - Asset System', () => {
  test('any asset combination should produce valid scene', () => {
    fc.assert(
      fc.property(
        // 무작위 배경 생성
        fc.sampled.constant(['beach', 'forest', 'city']).chain(bg =>
          fc.tuple(
            fc.constant(bg),
            // 무작위 캐릭터 배열
            fc.array(
              fc.record({
                asset: fc.sampled.constant([
                  'nook_happy', 'nook_sad', 'player_standing'
                ]),
                x: fc.integer({ min: 0, max: 800 }),
                y: fc.integer({ min: 0, max: 600 })
              }),
              { minLength: 0, maxLength: 10 }
            )
          )
        ),
        async (bg, chars) => {
          const sceneJson = {
            background: `${bg}.png`,
            characters: chars
          };

          const scene = await composer.composeScene(sceneJson);

          // 속성 1: Scene은 항상 layers 배열을 가짐
          expect(Array.isArray(scene.layers)).toBe(true);

          // 속성 2: layers 개수는 background(1) + characters 개수
          expect(scene.layers.length).toBe(1 + chars.length);

          // 속성 3: 모든 layer는 정의된 타입을 가짐
          const validTypes = ['background', 'character', 'ui'];
          scene.layers.forEach(layer => {
            expect(validTypes).toContain(layer.type);
          });

          // 속성 4: Z-index는 유니크해야 함
          const zIndices = scene.layers.map(l => l.zIndex);
          const uniqueZIndices = new Set(zIndices);
          expect(uniqueZIndices.size).toBe(zIndices.length);

          // 속성 5: 모든 character는 유효한 x, y 좌표
          scene.layers
            .filter(l => l.type === 'character')
            .forEach(layer => {
              expect(layer.x).toBeGreaterThanOrEqual(0);
              expect(layer.y).toBeGreaterThanOrEqual(0);
            });
        }
      ),
      { numRuns: 1000 }
    );
  });
});
```

**검증 항목**:
- ✅ 1000개의 무작위 조합 테스트
- ✅ 모든 조합에서 유효한 Scene 생성
- ✅ 논리적 불변 만족

---

### 3.2 메타모르픽 테스트 (Scene 변환 일관성)

```javascript
describe('Metamorphic Testing - Asset Consistency', () => {
  test('scene with same characters in different order should be similar', async () => {
    // Scene 1: A, B 순서
    const scene1 = await composer.composeScene({
      background: 'beach.png',
      characters: [
        { asset: 'nook_happy.png', x: 100, y: 200 },
        { asset: 'player_standing.png', x: 300, y: 200 }
      ]
    });

    // Scene 2: B, A 순서 (다른 순서)
    const scene2 = await composer.composeScene({
      background: 'beach.png',
      characters: [
        { asset: 'player_standing.png', x: 300, y: 200 },
        { asset: 'nook_happy.png', x: 100, y: 200 }
      ]
    });

    // 메타모르픽 속성:
    // 1. 두 Scene의 레이어 수는 같아야 함
    expect(scene1.layers.length).toBe(scene2.layers.length);

    // 2. 같은 에셋들이 포함되어 있어야 함
    const assets1 = scene1.layers.map(l => l.asset).sort();
    const assets2 = scene2.layers.map(l => l.asset).sort();
    expect(assets1).toEqual(assets2);

    // 3. 캐시 상태는 같아야 함
    expect(assetManager.getCacheSize()).toBeGreaterThan(0);
  });

  test('rendering same scene twice should use cache', async () => {
    const sceneJson = {
      background: 'beach.png',
      characters: [{ asset: 'nook_happy.png', x: 100, y: 200 }]
    };

    // 첫 번째 렌더
    const time1 = await measureRenderTime(sceneJson);

    // 두 번째 렌더 (캐시됨)
    const time2 = await measureRenderTime(sceneJson);

    // 메타모르픽 속성:
    // 두 번째가 훨씬 빠르거나 같아야 함
    expect(time2).toBeLessThanOrEqual(time1);

    // 속성: 캐시 히트율이 높아야 함
    const cacheStats = assetManager.getCacheStats();
    const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses);
    expect(hitRate).toBeGreaterThan(0.8); // 80% 이상
  });
});
```

**검증 항목**:
- ✅ 논리적 일관성
- ✅ 캐시 효율성
- ✅ 성능 개선

---

### 3.3 형식 검증 (Scene Schema)

```javascript
describe('Formal Verification - Scene Schema', () => {
  const sceneSchema = {
    layers: expect.arrayContaining([
      expect.objectContaining({
        type: expect.stringMatching(/background|character|ui/),
        asset: expect.any(String),
        x: expect.any(Number),
        y: expect.any(Number),
        zIndex: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number)
      })
    ]),
    canvasWidth: expect.any(Number),
    canvasHeight: expect.any(Number)
  };

  test('all scenes must conform to schema', async () => {
    const scenes = [
      { background: 'beach.png', characters: [] },
      {
        background: 'forest.png',
        characters: [
          { asset: 'nook_happy.png', x: 100, y: 200 }
        ]
      },
      {
        background: 'city.png',
        characters: [
          { asset: 'nook_sad.png', x: 50, y: 150 },
          { asset: 'player_standing.png', x: 400, y: 200 }
        ]
      }
    ];

    for (const sceneJson of scenes) {
      const scene = await composer.composeScene(sceneJson);
      expect(scene).toMatchObject(sceneSchema);

      // 추가 검증
      scene.layers.forEach(layer => {
        expect(layer.width).toBeGreaterThan(0);
        expect(layer.height).toBeGreaterThan(0);
        expect(layer.zIndex).toBeGreaterThanOrEqual(0);
      });
    }
  });
});
```

**검증 항목**:
- ✅ 스키마 정합성
- ✅ 필수 필드 존재
- ✅ 데이터 타입 일치

---

### 3.4 돌연변이 테스트 (캐시 로직)

```javascript
// 원래 코드
function getCachedAsset(id) {
  if (cache.has(id)) {
    return cache.get(id); // 캐시에서 반환
  }
  const asset = loadFromDB(id);
  cache.set(id, asset);
  return asset;
}

// 돌연변이 1: DB 호출 항상 실행
function mutant1(id) {
  const asset = loadFromDB(id); // DB 호출 누락
  return asset;
}

// 돌연변이 2: 캐시 저장 누락
function mutant2(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  return loadFromDB(id); // cache.set 누락
}

describe('Mutation Testing - Cache Logic', () => {
  test('should use cached asset on second call', () => {
    const spy = jest.spyOn(db, 'load');

    // 첫 번째 호출
    const asset1 = getCachedAsset('beach.png');
    expect(spy).toHaveBeenCalledTimes(1);

    // 두 번째 호출
    const asset2 = getCachedAsset('beach.png');
    expect(spy).toHaveBeenCalledTimes(1); // DB 호출 안 됨 (캐시 사용)
    expect(asset1).toBe(asset2);

    // 이 테스트가 mutant1, mutant2를 잡을 수 있음
  });

  test('should cache new assets', () => {
    const asset = getCachedAsset('new_asset.png');
    expect(cache.has('new_asset.png')).toBe(true);
  });
});
```

**검증 항목**:
- ✅ 테스트가 캐시 로직 검증
- ✅ DB 호출 횟수 확인
- ✅ 캐시 저장 검증

---

## 👥 Stage 4: Product Level 테스트

**목표**: 실제 사용자가 원하는가?

### 4.1 사용성 테스트

```javascript
describe('Usability Tests - Story Page', () => {
  test('user can understand scene transitions', async () => {
    await page.goto('http://localhost:3000/story');

    // 1. 초기 scene이 명확한가?
    const initialScene = await page.textContent('.scene-title');
    expect(initialScene).toContain('Scene 1');

    // 2. Next 버튼이 명확한가?
    const nextButton = await page.$('button:has-text("다음")');
    expect(nextButton).toBeDefined();

    // 3. 클릭 후 변경이 명확한가?
    const beforeScene = await page.textContent('.scene-content');
    await page.click('button:has-text("다음")');
    await page.waitForTimeout(500);
    const afterScene = await page.textContent('.scene-content');

    expect(beforeScene).not.toBe(afterScene);

    // 4. 사용자가 진행 상황을 알 수 있는가?
    const progress = await page.textContent('.progress-indicator');
    expect(progress).toMatch(/\d+\/\d+/); // "1/4" 형식
  });

  test('error messages should be clear for users', async () => {
    // Asset 로드 실패 상황 시뮬레이션
    const errorMsg = await page.$('.error-message');
    if (errorMsg) {
      const text = await errorMsg.textContent();
      // 사용자 친화적인 메시지인가?
      expect(text).not.toContain('404');
      expect(text).toContain('다시 시도');
    }
  });
});
```

**검증 항목**:
- ✅ UI 명확성
- ✅ 피드백 명확성
- ✅ 오류 메시지 친화성

---

### 4.2 호환성 테스트

```javascript
describe('Compatibility Tests', () => {
  [
    { browser: 'chromium', name: 'Chrome' },
    { browser: 'firefox', name: 'Firefox' },
    { browser: 'webkit', name: 'Safari' }
  ].forEach(({ browser, name }) => {
    test(`should render assets on ${name}`, async () => {
      const browserInstance = await chromium.launch();
      const page = await browserInstance.newPage();

      await page.goto('http://localhost:3000/story');
      await page.waitForSelector('.story-canvas');

      // 에셋이 렌더링되었는가?
      const hasAssets = await page.$('.asset-image');
      expect(hasAssets).toBeDefined();

      await browserInstance.close();
    });
  });

  test('should work on mobile devices', async () => {
    // Mobile viewport 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000/story');
    await page.waitForSelector('.story-canvas');

    // 레이아웃 재계산 확인
    const canvasWidth = await page.$eval(
      '.story-canvas',
      el => el.offsetWidth
    );

    expect(canvasWidth).toBeLessThanOrEqual(375);
  });
});
```

**검증 항목**:
- ✅ 다중 브라우저 호환성
- ✅ 모바일 반응형
- ✅ 성능 유지

---

### 4.3 탐색적 테스트 (Exploratory)

```
테스트할 시나리오:
1. 매우 긴 스토리 (50개 scene)
   → Scene 렌더링 성능 저하 없는가?

2. 매우 많은 캐릭터 (20개)
   → 메모리 문제 없는가?

3. 느린 네트워크 (3G)
   → Asset 로딩 오류는 없는가?

4. 강제 새로고침
   → State 복구 가능한가?

5. 뒤로가기 버튼
   → Previous scene 정상인가?
```

---

## 🚀 Stage 5-7: DevOps/Ops 테스트

### 5.1 CI/CD 파이프라인

```yaml
# GitHub Actions
name: Asset System CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Stage 1
      - name: Static Analysis
        run: npm run lint

      # Stage 2
      - name: Unit Tests
        run: npm test src/components/AssetManager
        run: npm test src/components/SceneComposer

      # Stage 3
      - name: Property Tests
        run: npm test -- --testPathPattern=property

      # Stage 4
      - name: E2E Tests
        run: npx playwright test

      # Stage 5
      - name: Performance Tests
        run: npm run test:performance

      # 배포
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: npm run deploy
```

### 6.1 모니터링 지표

```
캐시 성능:
├─ 히트율: > 80%
├─ 평균 응답 시간: < 100ms
└─ 메모리 사용: < 100MB

렌더링 성능:
├─ FPS: > 60
├─ 프레임 타임: < 16ms
└─ 로딩 시간: < 2초

에러율:
├─ Asset 로딩 실패: < 1%
├─ Scene 렌더링 실패: < 1%
└─ 메모리 누수: 없음
```

### 7.1 테스트 보고서

```markdown
# Asset System 테스트 보고서 - Phase 3.1

## 요약
- Stage 1: 95/100 ✅ (95% 통과)
- Stage 2: 48/50 ⚠️  (96% 통과)
- Stage 3: 35/35 ✅ (100% 통과)
- Stage 4: 18/20 ⚠️  (90% 통과)
- **전체**: 196/205 (95.6% 통과)

## 주요 발견
1. 캐시 히트율: 85% ✅
2. 평균 로딩 시간: 1.2초 ✅
3. 메모리 누수: 없음 ✅

## 개선 필요
1. Stage 2 - 느린 네트워크 테스트 (2개 실패)
2. Stage 4 - 모바일 UI 최적화 (2개 실패)

## 다음 단계
- [ ] 느린 네트워크 시뮬레이션 개선
- [ ] 모바일 레이아웃 최적화
- [ ] Stage 5-7 테스트 추가
```

---

## ✅ DoD (Definition of Done)

### Phase 3.0 (준비)

에셋 시스템 테스트 Framework 준비:

- [ ] Stage 1-7 테스트 계획 수립
- [ ] 테스트 환경 구성 (Jest, Playwright, k6)
- [ ] Sample 테스트 코드 작성 (각 Stage별 1개)
- [ ] 팀 교육 완료

**성공 기준**: 팀이 테스트 프레임워크를 이해하고 실행 가능

---

### Phase 3.1 (MVP)

AssetManager & SceneComposer 구현 및 테스트:

#### Code Level (Stage 1)
- [ ] AssetManager 단위 테스트 작성 (≥10개)
- [ ] SceneComposer 단위 테스트 작성 (≥10개)
- [ ] 정적 분석 통과
  - TypeScript 오류: 0개
  - ESLint 심각: 0개
  - npm audit: 0개 Moderate 이상
- [ ] **테스트 커버리지**: ≥95%

#### System Level (Stage 2)
- [ ] E2E 테스트 작성 (≥10개)
- [ ] 성능 테스트
  - 초기 로드: < 2초
  - Scene 변경: < 500ms
  - 메모리: < 100MB
- [ ] 보안 테스트 통과
  - XSS 방지: 100%
  - CSRF 방지: 100%
- [ ] 부하 테스트
  - 1000 동시 연결 처리
  - 에러율: < 1%

#### Advanced Logic (Stage 3)
- [ ] 속성 기반 테스트 (1000회 반복)
- [ ] 메타모르픽 테스트 (5개 시나리오)
- [ ] 형식 검증 (Schema 일치 100%)
- [ ] 돌연변이 테스트 (Mutation 탐지율 > 90%)

**성공 기준**: 모든 Stage 1-3 테스트 통과 (≥95%)

---

### Phase 3.2 (최적화)

에셋 시스템 최적화 및 확장 테스트:

#### Product Level (Stage 4)
- [ ] 사용성 테스트 (실제 사용자 5명)
- [ ] 호환성 테스트 (3개 브라우저)
- [ ] 탐색적 테스트 (엣지 케이스 20개 이상)
- [ ] **사용자 만족도**: ≥80%

#### DevOps (Stage 5)
- [ ] CI/CD 파이프라인 구성
- [ ] 자동 배포 스크립트 작성
- [ ] 배포 정책 코드화

#### Operations (Stage 6)
- [ ] 모니터링 대시보드 구성
- [ ] 알림 규칙 설정
- [ ] 자동 복구 스크립트 작성

**성공 기준**: 모든 Stage 4-6 테스트 통과, 배포 준비 완료

---

### Phase 3.3 (확장)

프로덕션 배포 및 문서화:

#### Learning & Documentation (Stage 7)
- [ ] 테스트 보고서 작성
  - 커버리지: 100%
  - 모든 실패 항목 분석
- [ ] 러닝 노트 작성
  - 효과적이었던 테스트 기법
  - 개선 필요 사항
- [ ] 지속적 개선 계획 수립

#### 최종 검증
- [ ] 모든 Stage 통과
- [ ] 성능 목표 달성
- [ ] 보안 검증 완료
- [ ] 사용자 피드백 긍정 (≥80%)
- [ ] 배포 준비 완료

**성공 기준**: 완전한 테스트 커버리지, 프로덕션 배포 준비

---

## 📊 테스트 메트릭 정의

### 커버리지

```
Line Coverage: ≥95%
Branch Coverage: ≥90%
Function Coverage: 100%

예시:
function composeScene(json) {
  if (!json.background) {      // Branch 1
    throw new Error(...);       // Line 1, 2
  }
  return createScene(json);     // Line 3
}

라인: 3줄
브랜치: 2가지 (if/else)
함수: 1개
```

### 성능

```
응답 시간 (Response Time):
- p50 (중앙값): < 200ms
- p95 (95 백분위수): < 500ms
- p99 (99 백분위수): < 1000ms

에러율:
- < 1% (1000개 요청 중 < 10개 실패)

처리량:
- > 100 req/sec
```

---

## 🎯 다음 문서

다음으로 읽을 문서:

1. **`02_NEURO_NOOK_AI_TESTING_STRATEGY.md`** - AI NPC 테스트 전략
2. **`03_INTEGRATION_TESTING_STRATEGY.md`** - 통합 테스트
3. **`04_PHASE_SUCCESS_CRITERIA.md`** - Phase별 DoD
4. **`05_TESTING_CHECKLIST.md`** - 실행 체크리스트

🦝 완벽한 에셋 시스템 테스트를 시작하세요! ✨
