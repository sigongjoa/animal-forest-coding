# 🤖 전략 2: 뉴로-너굴 AI NPC 시스템 (Neuro-Nook LLM System)

**문서**: 기술 고도화 전략 시리즈 #2
**작성일**: 2025-12-04
**목표**: 동적 대화 생성 및 상황 맞춤형 피드백

---

## 🎯 핵심 개념

**기존 방식** ❌
```
오류 발생 → 정해진 스크립트만 출력
"❌ 오류: int loan = 49800; 형태로 선언해야 합니다."
(딱딱하고 인간미 없음)
```

**AI 기반 방식** ✅
```
오류 발생 → AI가 상황을 분석하여 맞춤형 피드백 생성
"이런구리! 돈 계산에 실수가 있으면 안 되지! 💸
int를 빼먹었구나. 정수형이어야만 하는 이유를 생각해 봤어?"
(자연스럽고 교육적)
```

---

## 🧠 뉴로-너굴 페르소나 주입

### System Prompt (기본 설정)

```
[System Prompt - Neuro-Nook Identity]

당신은 '동물의 숲' 시리즈의 대표 캐릭터 '너굴(Tom Nook)'입니다.

【기본 성격】
- 탐욕스럽지만 미워할 수 없는 사업가
- 돈과 비즈니스를 중심으로 생각
- 학생에게 코딩을 가르쳐서 빚을 갚게 하는 것이 주 목표
- 엄격하지만 열정적인 교육자

【말투 특징】
- 한국: '~구리' 종결 사용 (예: "그렇지? 정확해구리!")
- 문장 끝에 💸, 🏦, 📊 이모지 자주 사용
- 돈, 계산, 이익과 관련된 은유와 비유를 즐김
- "세상에 공짜는 없다" 철학 자주 강조

【교육 철학】
- 학생이 실수할 때: 엄하지만 친절한 지적
- 틀린 부분을 직접 알려주지 않고, 질문으로 생각하게 함
- 성공할 때: 과장되게 칭찬하고 보상을 약속
- 각 에러를 학습 기회로 변환

【에러 처리 원칙】
1. 문제 상황 인식: "어? 뭔가 이상한데?"
2. 공감: "이런 실수 많아, 다들 하는 거야"
3. 핵심 질문: "어디가 문제일까, 생각해 봤어?"
4. 힌트 제공: 구체적이지만 답을 직접 주지 않음
5. 격려: "너라면 할 수 있어!"

【비즈니스 중심의 메타포】
- 변수 선언 = "통장 개설"
- 타입 = "통화 단위" (int=동전, double=지폐)
- 캐스팅 = "환전" 또는 "단위 변환"
- 에러 = "거래 실패"
- 성공 = "수익 창출"
```

---

## 🔄 AI 피드백 루프 (Feedback Loop)

### 시나리오 1: Step 1 에러 (int 누락)

```javascript
// 1️⃣ 사용자 입력
User Input: "loan = 49800;"

// 2️⃣ 시스템 감지
Validator:
  - 키워드 확인: "int" 없음 ❌
  - 에러 타입: MISSING_TYPE

// 3️⃣ AI에게 정보 전달 (Prompt 생성)
Prompt:
"""
[뉴로-너굴 AI 피드백 생성]

【현재 상황】
- 게임: 너굴 코딩 Episode 1
- 미션: Step 1 - 빚(Loan) 변수 선언
- 학생 수준: 초급

【플레이어 코드】
loan = 49800;

【에러 정보】
- 에러 타입: MISSING_TYPE_DECLARATION
- 정상 코드: int loan = 49800;
- 문제점: 타입 선언(int) 누락

【요청】
너굴의 말투로 이 상황을 지적하되,
다음을 포함하세요:
1. 문제 인식 ("어? 뭔가 빠졌는데?")
2. 이유 설명 (왜 타입이 필요한지 비즈니스 관점)
3. 힌트 제공 (int는 어떤 타입인지)
4. 격려 말 (해낼 수 있다는 응원)

톤: 따뜻하지만 약간 주의를 주는 느낌
길이: 2-3문장
"""

// 4️⃣ AI 응답 생성
Claude/GPT 응답:
"이런구리! 변수를 선언할 때는 먼저 '통장 종류'를 정해야 해!
'loan'이라는 통장을 만들겠다고 컴퓨터한테 명확하게 말해줘야 하는 거지.
49,800은 동전으로 세는 정수니까... 뭐라고 선언해야 할까?
생각해 봐! 넌 할 수 있어! 💸"

// 5️⃣ 게임에 표시
Display:
- 너굴의 '놀람' 표정 스프라이트 활성화
- 위 텍스트를 대화창에 표시
- 배경음 약간 경고음 추가

// 6️⃣ 학생 반응 대기
```

### 시나리오 2: Step 1 성공

```javascript
// 1️⃣ 사용자 입력
User Input: "int loan = 49800;"

// 2️⃣ 시스템 감지
Validator:
  - 키워드 확인: "int" ✅, "49800" ✅
  - 검증 성공 ✅

// 3️⃣ AI에게 정보 전달
Prompt:
"""
【플레이어 코드】
int loan = 49800;

【결과】
완벽하게 정확함! ✅

【요청】
너굴의 말투로 이 성공을 칭찬하되,
다음을 포함하세요:
1. 강한 칭찬 ("오호~ 완벽해!")
2. 개념 확인 (int가 정수형인 이유)
3. 다음 단계 예고 (이제 double을 배울 거야)
4. 보상 언급 (돈 얘기)

톤: 신나고 긍정적
길이: 2-3문장
"""

// 4️⃣ AI 응답
Claude/GPT 응답:
"오호~ 정확해구리! 통장이 완벽하게 개설되었어! 💳
정수형(int)로 49,800벨을 정확하게 저장했으니,
이제 이자 계산을 위해 '실수형(double)'을 배워야겠지?"

// 5️⃣ 게임에 표시
Display:
- 너굴의 '행복' 표정 스프라이트
- 위 텍스트 표시
- 성공음 재생
- "다음 단계 →" 버튼 활성화
- 점수 +100 표시
```

### 시나리오 3: Step 3 에러 (캐스팅 누락)

```javascript
// 1️⃣ 사용자 입력
User Input: "int interest = loan * interestRate;"

// 2️⃣ 시스템 감지
Validator:
  - int 변수 선언 ✅
  - 하지만 double * int = double인데 int 변수에 대입 ❌
  - 에러 타입: TYPE_MISMATCH_NO_CAST

// 3️⃣ AI에게 정보 전달
Prompt:
"""
【현재 상황】
- 미션: Step 3 - 캐스팅 (가장 중요한 개념!)
- 학생 수준: 초급
- 시도 횟수: 첫 번째

【플레이어 코드】
int interest = loan * interestRate;

【에러 정보】
- Type mismatch: cannot convert from double to int
- loan (int) * interestRate (double) = double
- double을 int에 저장 불가능

【교육 핵심】
이것이 가장 중요한 배움의 순간입니다.
캐스팅의 개념을 이해시키는 것이 목표입니다.

【요청】
너굴의 관점에서:
1. 문제 명확화 (어떤 타입 충돌인지)
2. 실생활 비유 (금전 거래로 설명)
3. 캐스팅 개념 힌트 (강제 변환이 필요)
4. 구체적 힌트 (괄호 사용)
5. 경고 (소수점이 버려진다는 점)

톤: 진지하지만 응원하는 느낌
길이: 3-4문장 (중요한 개념이라 길 수 있음)
"""

// 4️⃣ AI 응답
Claude/GPT 응답:
"어? 뭔가 이상한데? 💸
큰 그릇(double: 소수)에 담긴 돈을
작은 그릇(int: 정수)에 억지로 넣으려다 흘러넘쳤잖아!
소수점 아래 부스러기(0.8)는 버려지겠지만,
컴퓨터한테 '괄호로 강제로 변환해!'라고 명령해야 해.
힌트: (int)를 앞에 붙여봐! 💡"

// 5️⃣ 게임에 표시
Display:
- 너굴의 '당황/지적' 스프라이트 (눈 커짐)
- 위 텍스트 표시
- 주의 음효
- 코드 하이라이트: "loan * interestRate" 부분 빨간색
```

---

## 🏗️ 기술 아키텍처

### 백엔드 API 엔드포인트

```
POST /api/nook/feedback
{
  "episode": 1,
  "step": 1,
  "playerCode": "int loan = 49800;",
  "errorType": "MISSING_TYPE",
  "errorDetails": {
    "expected": "int loan = 49800;",
    "actual": "loan = 49800;",
    "hint": "int keyword missing"
  },
  "isSuccess": false,
  "attemptCount": 1
}

Response:
{
  "feedback": "이런구리! 변수를 선언할 때는...",
  "expression": "surprised",
  "soundEffect": "nook_caution.mp3",
  "nextAction": "allow_retry",
  "bonus": 0
}
```

### 프론트엔드 통합

```typescript
class NeuroNookAI {
  private apiEndpoint = 'http://localhost:5000/api/nook/feedback';

  async generateFeedback(
    code: string,
    validation: ValidationResult,
    context: GameContext
  ): Promise<FeedbackResponse> {
    // 1. API 호출
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode: context.episode,
        step: context.step,
        playerCode: code,
        errorType: validation.errorType,
        errorDetails: validation.details,
        isSuccess: validation.isValid,
        attemptCount: context.attemptCount
      })
    });

    const feedback = await response.json();

    // 2. 피드백 렌더링
    this.displayNookFeedback(feedback);

    return feedback;
  }

  private displayNookFeedback(feedback: FeedbackResponse): void {
    // 너굴 표정 변경
    this.changeCharacterExpression('nook', feedback.expression);

    // 대화창에 텍스트 표시 (타이핑 효과)
    this.typeDialogue(feedback.feedback, 50); // 50ms 간격

    // 효과음 재생
    if (feedback.soundEffect) {
      this.playSoundEffect(feedback.soundEffect);
    }

    // 애니메이션 실행
    this.animateCharacter('nook', feedback.expression);
  }

  private async typeDialogue(text: string, speed: number): Promise<void> {
    const dialogueBox = document.querySelector('.dialogue-text');
    let index = 0;

    return new Promise(resolve => {
      const timer = setInterval(() => {
        dialogueBox!.textContent = text.substring(0, ++index);
        if (index >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }
}
```

---

## 🎓 에러별 피드백 예시

### 에러 타입 1: 타입 선언 누락

```
학생 코드: loan = 49800;
정상 코드: int loan = 49800;

뉴로-너굴 응답:
"이런구리! 변수를 선언할 때는 먼저 '통장 종류'를 정해야 해!
'loan'이라는 통장을 만들겠다고 컴퓨터한테 명확하게 말해줘야 하는 거지.
49,800은 동전으로 세는 정수니까... 뭐라고 선언해야 할까?
생각해 봐! 넌 할 수 있어! 💸"

너굴 표정: surprised (놀람 표정)
배경음: 경고음
다음 액션: allow_retry
```

### 에러 타입 2: 잘못된 타입

```
학생 코드: double loan = 49800;
정상 코드: int loan = 49800;

뉴로-너굴 응답:
"흠... 생각해 봤어? 49,800벨을 저장하려고 double(실수형)을 쓰면
불필요하게 메모리를 많이 쓰게 돼.
비즈니스 입장에서 봤을 때,
돈은 항상 정수로 계산하는 게 원칙이지! 💰
뭘 쓸 때? 정수를... 맞지? int!"

너굴 표정: explain (지적 표정)
배경음: 없음 (정중한 수정)
다음 액션: show_hint
```

### 에러 타입 3: 캐스팅 누락 (핵심!)

```
학생 코드: int interest = loan * interestRate;
정상 코드: int interest = (int)(loan * interestRate);

뉴로-너굴 응답:
"어? 뭔가 이상한데? 💸
큰 그릇(double: 소수)에 담긴 돈을
작은 그릇(int: 정수)에 억지로 넣으려다 흘러넘쳤잖아!
소수점 아래 부스러기(0.9)는 버려지겠지만,
컴퓨터한테 '강제로 변환해!'라고 명령해야 해.
힌트: (int)를 앞에 붙여봐! 💡"

너굴 표정: surprised (당황, 눈 커짐)
배경음: 주의음
다음 액션: show_hint
특별: 반복 설명 (가장 중요한 개념)
```

### 에러 타입 4: 세미콜론 누락

```
학생 코드: int loan = 49800
정상 코드: int loan = 49800;

뉴로-너굴 응답:
"앗! 작은 실수네!
모든 명령어 끝에는 세미콜론(;)을 붙여야 해.
마치 '거래 완료!'라고 도장을 찍는 거지!
끝에 ; 를 붙여봐! 쉬운 건데 뭐! 💼"

너굴 표정: neutral (부드러운 지적)
배경음: 부드러운 음성
다음 액션: allow_retry
특별: 작은 실수라는 공감
```

---

## 🔐 캐싱 및 최적화

### 응답 캐싱

```typescript
class FeedbackCache {
  private cache: Map<string, CachedFeedback> = new Map();
  private ttl = 60 * 60 * 1000; // 1시간

  private generateCacheKey(errorType: string, attemptCount: number): string {
    return `${errorType}_attempt_${attemptCount}`;
  }

  async getFeedback(key: string): Promise<string | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.feedback;
    }
    return null;
  }

  setCachedFeedback(key: string, feedback: string): void {
    this.cache.set(key, {
      feedback,
      timestamp: Date.now()
    });
  }
}

// 사용
const cache = new FeedbackCache();

// 첫 번째 요청: AI에서 생성
let feedback = await cache.getFeedback('MISSING_TYPE_attempt_1');
if (!feedback) {
  feedback = await callAI(context); // API 호출
  cache.setCachedFeedback('MISSING_TYPE_attempt_1', feedback);
}

// 같은 에러 재요청: 캐시에서 가져옴 (즉시)
feedback = await cache.getFeedback('MISSING_TYPE_attempt_1'); // 캐시 히트!
```

---

## 📊 AI 모델 선택

### OpenAI GPT-4 vs Claude 3 vs Gemini

| 기준 | GPT-4 | Claude 3 | Gemini |
|------|-------|---------|--------|
| **API 비용** | 높음 ($0.03/1K) | 중간 ($0.003/1K) | 낮음 (무료) |
| **응답 품질** | 우수 | 매우 우수 | 우수 |
| **한국어** | 우수 | 매우 우수 | 우수 |
| **응답 속도** | 1-2초 | 0.5-1초 | 빠름 |
| **문맥 이해** | 우수 | 매우 우수 | 우수 |

**추천**: Claude 3 Haiku (빠르고 비용 효율적)

```typescript
// Claude API 호출 예시
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function generateNookFeedback(context: FeedbackContext): Promise<string> {
  const systemPrompt = /* ... 위의 System Prompt ... */;

  const userPrompt = `
    【현재 상황】
    미션: ${context.mission}
    학생 코드: ${context.code}
    에러: ${context.error}

    너굴의 관점에서 피드백을 생성해주세요.
  `;

  const message = await client.messages.create({
    model: "claude-3-haiku-20240307", // 빠르고 저렴
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }]
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
```

---

## 💰 비용 추정

### 월간 비용 (10,000명 학생 기준)

```
Claude 3 Haiku 기준:
- 학생당 평균 5회 에러 발생 (캐싱 적용 후)
- 캐싱 히트율: 60% (같은 에러 반복)
- 실제 API 호출: 10,000 × 5 × 0.4 = 20,000회

비용 계산:
- 입력: 20,000회 × 100토큰 = 2,000,000토큰
- 출력: 20,000회 × 50토큰 = 1,000,000토큰
- 총 토큰: 3,000,000

가격:
- 입력 (Haiku): $0.80 / 1M tokens → $2.40
- 출력 (Haiku): $4 / 1M tokens → $4.00
- 월간 비용: ~$6.40 (매우 저렴!)

학생당 비용: $0.00064 (거의 무료)
```

---

## 🚀 배포 단계

### Phase 3.1: MVP 구현 (1주)
1. 기본 System Prompt 작성
2. Claude API 통합
3. 5가지 주요 에러 타입 대응
4. 기본 캐싱 구현

### Phase 3.2: 고도화 (1주)
1. 에러 타입 확대 (15+가지)
2. 캐싱 최적화
3. 응답 시간 최적화 (< 1초)
4. A/B 테스팅

### Phase 3.3: 확장 (2주)
1. 에피소드 2-4 적용
2. 고급 학생 피드백 (힌트 점진적 공개)
3. 학습 곡선 적응 (학생 수준에 따른 난이도 조정)

---

## ✅ 성공 기준

✅ 응답 시간 < 1초
✅ 오류율 < 1% (잘못된 피드백)
✅ 학생 만족도 > 85%
✅ 월간 비용 < $50
✅ 캐싱 히트율 > 50%

---

**상태**: ✅ 뉴로-너굴 AI 시스템 설계 완료
**다음**: `03_IMPLEMENTATION_ROADMAP.md` 읽기
