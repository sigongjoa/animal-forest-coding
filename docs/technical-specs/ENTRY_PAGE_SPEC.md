# 📋 Nook Coding Platform - 엔트리 페이지 기술 설계서

## 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Nook Coding Platform |
| **기능명** | 엔트리 페이지 (로그인/회원가입 진입점) 구현 |
| **작성일** | 2025.12.01 |
| **기술 스택** | React (TypeScript), Tailwind CSS, Web Audio API |
| **우선순위** | 높음 (사용자 첫 인상 결정) |
| **상태** | 설계 완료 (개발 준비 단계) |

---

## 1. 개요 및 목표 (Overview & Objective)

### 1.1 핵심 목표
동물의 숲 **'Dodo Airlines (DAL) 공항 카운터'** 를 테마로 한 **몰입형 로그인 페이지**를 구현한다.
- 사용자가 코딩 학습을 시작하는 것을 "새로운 섬으로의 여행"으로 느끼게 한다
- 딱딱한 교육 플랫폼 이미지를 탈피하고 **게임처럼 흥미를 유발**한다
- 첫 페이지에서부터 "동물의 숲" 세계관에 몰입하도록 한다

### 1.2 핵심 컨셉
```
정적인 배경 이미지 + 동적인 HTML/CSS 요소 + 리액트 로직
= 살아있는 경험 제공
```
- 배경: 공항 카운터의 고정된 배경 이미지
- 캐릭터: 로드리(Orville) NPC가 숨을 쉬듯 움직임
- 폼: 여권(탑승권) 스타일의 로그인 폼
- 음향: Web Audio API를 통한 공항 테마 BGM + 상호작용 효과음

### 1.3 사용자 경험 플로우
```
페이지 진입
    ↓
[배경음악 시작] → BGM이 자동으로 재생 (또는 첫 클릭 후)
    ↓
로드리 NPC가 손을 흔들며 인사
    ↓
사용자 입력 (아이디 / 비밀번호)
    ↓
[타이핑 효과음] → 키보드 입력할 때마다 "토도독" 소리
    ↓
[클릭 효과음] → 출발 버튼 클릭 시 "띠링" 소리
    ↓
로그인 처리
```

---

## 2. 필요 에셋 체크리스트 (Asset Requirements)

개발 시작 전 다음 리소스를 **`frontend/public/assets/`** 경로 하위에 준비해야 한다.

### 2.1 이미지 (Images)

| 파일명 | 필수 | 스펙 | 설명 |
|--------|------|------|------|
| `bg_airport_counter.jpg` | ✅ | 1920x1080 (16:9) | 창밖 풍경, 바닥, 카운터 데스크가 모두 포함된 고해상도 배경 |
| `npc_orville.png` | ✅ | 투명 배경, 300~400px 권장 | 안내원 로드리 캐릭터 이미지 |
| `dal_logo.png` | ⭕ | 100x100px 정도 | 상단 타이틀 옆에 들어갈 DAL 로고 |
| `ui_passport_texture.png` | ⭕ | 500x500px | 로그인 폼 배경 텍스처 (없으면 CSS 단색으로 대체) |

**참고:**
- ✅ = 반드시 필요
- ⭕ = 선택 사항 (없어도 CSS로 구현 가능)

### 2.2 오디오 (Audio)

| 파일명 | 필수 | 스펙 | 설명 |
|--------|------|------|------|
| `bgm_airport.mp3` | ✅ | MP3, Loop 가능, 60~120초 | 공항 테마 배경음악 |
| `sfx_typing.wav` | ✅ | WAV, <0.2초 | 키보드 입력 시 "토도독" 짧은 효과음 |
| `sfx_click_confirm.wav` | ✅ | WAV, <0.5초 | 버튼 클릭 시 "띠링" 확인음 |
| `sfx_npc_welcome.wav` | ⭕ | WAV, <1초 | 페이지 진입 시 로드리 인사말 (동물의 숲 언어) |

**기술 노트:**
- WAV 파일: 플러그인 없이 Web Audio API로 직접 재생 가능
- MP3 파일: `<audio>` HTML5 태그로 재생
- 파일 크기: 각 효과음은 100KB 이하 권장 (빠른 로딩)

### 2.3 폰트 (Fonts)

| 폰트명 | 출처 | 용도 | 비고 |
|--------|------|------|------|
| 동글동글한 느낌 | Google Fonts | 제목, 본문 | 예: 'Fredoka', 'Varela Round', 'Noto Sans KR' |
| 고정폭 | 시스템 기본 | 테스트 시 임시 사용 | 나중에 교체 가능 |

---

## 3. Tailwind CSS 설정 명세 (tailwind.config.js)

동물의 숲 테마 색상과 전용 애니메이션을 확장 설정한다.

### 3.1 색상 팔레트 확장

```javascript
// tailwind.config.js - extends.colors 영역에 추가

theme: {
  extend: {
    colors: {
      // DAL (Dodo Airlines) 색상
      'dal-blue': '#27487E',      // DAL 대표 짙은 파랑
      'dal-yellow': '#F4C430',    // DAL 대표 밝은 노랑

      // Animal Crossing 기본 색상
      'ac-brown': '#7D5A44',      // 텍스트 및 테두리 갈색
      'ac-cream': '#FFFBEB',      // 밝은 크림색 (대화창, 폼 배경)
      'ac-blue': '#5381B7',       // 입력창 배경용 파랑
      'ac-light-blue': '#86A7D3', // 입력창 포커스 색

      // 보조 색상
      'ac-green': '#6BA42D',      // 성공 상태 (선택사항)
      'ac-orange': '#F77F00',     // 강조 (선택사항)
    },

    boxShadow: {
      'ac-hard': '0 4px 0 #7D5A44',  // 버튼용 딱딱한 3D 그림자
      'ac-light': '0 2px 4px rgba(0, 0, 0, 0.1)',  // 카드용 부드러운 그림자
    },

    animation: {
      'npc-breathe': 'npc-breathe 3s ease-in-out infinite',  // NPC 숨쉬기 모션
      'cloud-drift': 'cloud-drift 20s linear infinite',      // 구름 표류 (향후용)
    },

    keyframes: {
      'npc-breathe': {
        '0%, 100%': {
          transform: 'scale(1)',
          opacity: '1'
        },
        '50%': {
          transform: 'scale(1.02) translateY(-3px)',
          opacity: '1'
        }
      },
      'cloud-drift': {
        '0%': { transform: 'translateX(-100px)', opacity: '0' },
        '10%': { opacity: '1' },
        '90%': { opacity: '1' },
        '100%': { transform: 'translateX(100vw)', opacity: '0' }
      }
    }
  },
}
```

### 3.2 전역 스타일 (index.css 또는 globals.css)

```css
/* 기본 타이포그래피 설정 */
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Fredoka', 'Noto Sans KR', sans-serif;
  background-color: #f5f5f5;
  overflow: hidden; /* 스크롤 방지 */
}

/* 커스텀 스크롤바 (선택사항) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #7D5A44;
  border-radius: 4px;
}
```

---

## 4. 컴포넌트 구조 및 레이아웃 전략 (Architecture & Layout)

### 4.1 핵심 파일
```
frontend/src/
├── pages/
│   └── LoginPage.tsx              ← 메인 엔트리 페이지
├── styles/
│   └── LoginPage.css              ← 보충 CSS (있다면)
└── assets/                        ← Tailwind로 충분하면 불필요
```

**권장:** 단일 컴포넌트(`LoginPage.tsx`)로 구성. 나중에 폼만 분리하고 싶으면 그때 리팩토링.

### 4.2 Z-Index 레이어링 전략

가장 뒤에 배경 이미지를 깔고, 그 위에 요소들을 절대 위치(absolute)로 배치한다.

```
┌─────────────────────────────────────┐
│ Layer 3 (z-50): 로그인 폼 + 버튼    │  ← 사용자가 클릭하는 영역
├─────────────────────────────────────┤
│ Layer 2 (z-20): NPC 로드리 이미지   │  ← 캐릭터 (숨쉬기 애니메이션)
├─────────────────────────────────────┤
│ Layer 1 (z-10): 구름/동적 요소      │  ← 배경 상단 장식 (선택)
├─────────────────────────────────────┤
│ Layer 0 (z-0): 배경 이미지           │  ← 정적 배경
└─────────────────────────────────────┘
```

### 4.3 레이아웃 구조 표

| Layer | Z-Index | 요소 | 구현 방식 | 설명 |
|-------|---------|------|----------|------|
| **0 (Back)** | `z-0` | 배경 이미지 | `div.bg-cover` | `bg_airport_counter.jpg`를 전체 화면 배경으로 설정. 움직이지 않음. |
| **1 (Mid)** | `z-10` | 구름/동적 배경 | `div` + CSS animation | 선택사항. 배경 위에서 천천히 움직이는 구름 등 (있으면 더 생생함) |
| **2 (Char)** | `z-20` | NPC (로드리) | `img` 태그 | `npc_orville.png`를 카운터 뒤편 위치에 배치. **숨쉬기 애니메이션 필수** |
| **3 (Front)** | `z-30` | 로그인 폼 | `div` 컨테이너 | 실제 사용자가 상호작용하는 여권(탑승권) 스타일 영역. Input + Button 포함. |

### 4.4 반응형 디자인 기준점

```css
/* Tailwind 기본 breakpoint 기준 */
- sm: 640px   → 태블릿 초반
- md: 768px   → 태블릿 표준
- lg: 1024px  → 작은 데스크톱
- xl: 1280px  → 표준 데스크톱
- 2xl: 1536px → 큰 모니터

권장: 1400px 이상(원본 100%) → 1200~1400px(85%) → 768~1200px(70%) → 480~768px(60%) → <480px(55%)
```

---

## 5. 컴포넌트 슈도 코드 및 구현 가이드 (Component Pseudo Code)

### 5.1 전체 구조 슈도 코드

```typescript
// frontend/src/pages/LoginPage.tsx

import React, { useState, useEffect, useRef } from 'react';

const LoginPage: React.FC = () => {
  // ============ STATE 관리 ============
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orvileMessageIndex, setOrvileMessageIndex] = useState<number>(0);

  // ============ REF 관리 (오디오 제어) ============
  // HTML5 <audio> 태그와 연결하여 BGM 제어
  const bgmAudioRef = useRef<HTMLAudioElement>(null);
  const sfxTypingRef = useRef<HTMLAudioElement>(null);
  const sfxClickRef = useRef<HTMLAudioElement>(null);

  // ============ EFFECT: 브라우저 자동재생 정책 대응 ============
  useEffect(() => {
    // 브라우저는 사용자 상호작용 전까지 오디오 자동재생을 차단한다
    // 따라서 첫 클릭 시 재생을 시도한다

    const handleFirstInteraction = () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.play().catch(err => {
          console.log('BGM 자동재생이 브라우저에 의해 차단됨:', err);
          // 사용자가 수동으로 재생할 수 있도록 UI 제공 (선택사항)
        });
      }
      // 이벤트 리스너 제거 (한 번만 실행)
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // ============ HANDLER: 타이핑 효과음 ============
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (fieldName === 'username') {
      setUsername(e.target.value);
    } else {
      setPassword(e.target.value);
    }

    // 타이핑 효과음 재생 (쓰로틀링: 너무 많이 재생되지 않도록)
    if (sfxTypingRef.current) {
      // 현재 재생 중이면 처음부터 다시 시작 (중첩 방지)
      sfxTypingRef.current.currentTime = 0;
      sfxTypingRef.current.play().catch(() => {
        // 음악이 재생 안 됐으면 조용히 처리
      });
    }
  };

  // ============ HANDLER: 로그인 버튼 클릭 ============
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 클릭 효과음 재생 (버튼 피드백)
    if (sfxClickRef.current) {
      sfxClickRef.current.currentTime = 0;
      sfxClickRef.current.play().catch(() => {});
    }

    if (!username || !password) {
      alert('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 백엔드 API 호출 (예시)
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        // 로그인 성공 → IDE 페이지로 이동
        window.location.href = '/ide';
      } else {
        alert('로그인 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============ 로드리 메시지 배열 ============
  const orvileMessages = [
    '어서오세요! 다음 행선지는?',
    '뭐야, 짐이 많네.',
    '자, 탑승권을 준비하고 있어.',
  ];

  // ============ RETURN: JSX 렌더링 ============
  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">

      {/* ========== [LAYER 0] 배경 이미지 ========== */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg_airport_counter.jpg')" }}
      />

      {/* ========== [LAYER 1] 선택사항: 구름/동적 배경 ========== */}
      {/* (구현하고 싶으면 여기에 추가) */}

      {/* ========== [LAYER 2 + 3] 메인 콘텐츠 (상대 위치) ========== */}
      <div className="relative z-10 flex items-center gap-12 max-w-6xl">

        {/* [LAYER 2] NPC 로드리 */}
        <div className="flex flex-col items-center gap-4 relative z-20">
          <img
            src="/assets/npc_orville.png"
            alt="Orville"
            className="w-64 h-auto animate-npc-breathe drop-shadow-lg"
          />

          {/* 로드리 대화창 */}
          <div className="bg-ac-cream border-4 border-ac-brown rounded-3xl px-6 py-3 max-w-xs shadow-lg animate-fadeIn">
            <p className="text-ac-brown font-semibold text-center text-sm">
              {orvileMessages[orvileMessageIndex % orvileMessages.length]}
            </p>
          </div>
        </div>

        {/* [LAYER 3] 로그인 폼 (여권/탑승권 스타일) */}
        <div className="bg-gradient-to-br from-dal-blue to-blue-900 border-6 border-dal-yellow rounded-4xl p-8 shadow-2xl relative z-30 transform -rotate-1 hover:-rotate-0 transition-transform duration-300">

          {/* 카드 헤더 */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-dal-yellow mb-2">
              DAL AIRWAYS
            </h1>
            <p className="text-dal-yellow text-sm font-semibold">
              BOARDING PASS
            </p>
          </div>

          {/* 폼 구분선 */}
          <hr className="border-dal-yellow my-6" />

          {/* 로그인 폼 */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* 아이디 입력 필드 */}
            <div>
              <label className="block text-dal-yellow text-sm font-bold mb-2 uppercase">
                Passenger Name
              </label>
              <div className="flex items-center bg-ac-blue rounded-full border-2 border-ac-light-blue focus-within:border-dal-yellow transition-colors duration-200 px-4">
                <span className="text-white mr-2">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleTyping(e, 'username')}
                  placeholder="아이디"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white outline-none py-3 placeholder-gray-300"
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div>
              <label className="block text-dal-yellow text-sm font-bold mb-2 uppercase">
                Ticket Number
              </label>
              <div className="flex items-center bg-ac-blue rounded-full border-2 border-ac-light-blue focus-within:border-dal-yellow transition-colors duration-200 px-4">
                <span className="text-white mr-2">🎫</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleTyping(e, 'password')}
                  placeholder="비밀번호"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white outline-none py-3 placeholder-gray-300"
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-dal-yellow text-dal-blue font-black text-lg rounded-full uppercase shadow-ac-hard hover:shadow-[0_2px_0_#b45309] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? '탑승 준비 중...' : '🚁 출발하기'}
            </button>
          </form>

          {/* 카드 하단 */}
          <div className="mt-6 pt-4 border-t border-white border-opacity-30 text-center text-xs text-white">
            <p>계정이 없으신가요? <a href="#" className="text-dal-yellow font-bold hover:underline">회원가입</a></p>
          </div>
        </div>
      </div>

      {/* ========== 오디오 요소 (숨김) ========== */}
      <audio
        ref={bgmAudioRef}
        src="/assets/bgm_airport.mp3"
        loop
        crossOrigin="anonymous"
      />
      <audio
        ref={sfxTypingRef}
        src="/assets/sfx_typing.wav"
        crossOrigin="anonymous"
      />
      <audio
        ref={sfxClickRef}
        src="/assets/sfx_click_confirm.wav"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default LoginPage;
```

### 5.2 주의사항 및 팁

```typescript
// 1️⃣ 오디오 재생 정책 (중요!)
// 브라우저는 "사용자 상호작용" 전까지 음향 자동재생을 차단한다.
// 해결책:
const handleFirstInteraction = () => {
  bgmAudioRef.current?.play().catch(err => {
    // 재생 실패해도 조용히 진행
  });
  document.removeEventListener('click', handleFirstInteraction);
};
document.addEventListener('click', handleFirstInteraction);

// 2️⃣ 효과음 쓰로틀링 (타이핑 시 소리 중첩 방지)
// 키를 누르고 있으면 같은 효과음이 계속 재생되는 것을 방지
if (sfxTypingRef.current) {
  sfxTypingRef.current.currentTime = 0; // 처음부터 다시
  sfxTypingRef.current.play();
}

// 3️⃣ 이미지 로딩 보장
// public/assets/ 경로에 파일이 있어야만 작동
// 개발 중 파일 없으면: Cannot GET /assets/bg_airport_counter.jpg

// 4️⃣ 타입스크립트 안전성
// useRef<HTMLAudioElement>(null) 으로 명시적 타입 지정
// ref?.current?.play() 형태로 안전한 호출
```

---

## 6. 인터랙션 및 동작 명세 (Interaction Specs)

사용자 경험을 향상시키기 위한 동적 요소 상세 정의.

### 6.1 애니메이션 (CSS/Tailwind 기반)

#### 1️⃣ NPC 숨쉬기 (Idle Animation)
- **요소**: 로드리 이미지 (`npc_orville.png`)
- **동작**: 가만히 있지 않고 3초 주기로 미세하게 커졌다 작아진다
- **효과**: 둥실거리는 듯한 생동감 있는 느낌
- **구현**: Tailwind `animate-npc-breathe` 클래스
  ```html
  <img src="/assets/npc_orville.png" className="animate-npc-breathe" />
  ```
- **CSS**:
  ```css
  @keyframes npc-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02) translateY(-3px); }
  }
  animation: npc-breathe 3s ease-in-out infinite;
  ```

#### 2️⃣ 버튼 호버 (Hover Effect)
- **요소**: "출발하기" 버튼
- **동작**: 마우스 호버 시 배경색이 약간 밝아지고, 버튼이 위로 2px 올라옴
- **느낌**: 버튼이 눌리려고 준비하는 모습
- **구현**:
  ```html
  <button className="hover:shadow-[0_2px_0_#b45309] hover:translate-y-1 transition-all duration-100">
    출발하기
  </button>
  ```

#### 3️⃣ 버튼 클릭 (Active Effect)
- **요소**: 버튼 클릭 시
- **동작**: box-shadow가 줄어들고, 버튼이 아래로 눌리는 듯한 느낌
- **구현**:
  ```html
  <button className="active:shadow-none active:translate-y-2">
    출발하기
  </button>
  ```

#### 4️⃣ 입력 필드 포커스 (Input Focus)
- **요소**: 아이디/비밀번호 입력 필드
- **동작**: 클릭 시 테두리 색이 노란색(`dal-yellow`)으로 변함
- **구현**:
  ```html
  <div className="border-2 border-ac-light-blue focus-within:border-dal-yellow transition-colors">
    <input className="focus:outline-none" />
  </div>
  ```

#### 5️⃣ 로딩 상태 (Loading Animation)
- **요소**: 로그인 처리 중 버튼
- **동작**: 버튼이 맥박치듯 깜빡임 (opacity 변동)
- **구현**:
  ```html
  <button className={isLoading ? 'animate-pulse' : ''}>
    {isLoading ? '탑승 준비 중...' : '출발하기'}
  </button>
  ```

### 6.2 오디오 로직 (JavaScript/Web Audio API)

#### 1️⃣ BGM 배경음악 재생

**목표**: 페이지 진입 시 공항 테마 음악이 자동으로 흐르도록 함

**구현 흐름**:
```
useEffect(() => {
  // 1. 페이지 마운트 시 음악 자동재생 시도
  bgmAudioRef.current?.play();

  // 2. 브라우저 정책에 의해 차단되면...
  // 3. 사용자의 첫 클릭/터치 감지
  // 4. 그 순간에 음악 재생 허용
});

// 처음 클릭 시에만 재생
const handleFirstInteraction = () => {
  bgmAudioRef.current?.play().catch(err => {
    console.log('자동재생 차단됨:', err);
  });
  document.removeEventListener('click', handleFirstInteraction);
};

document.addEventListener('click', handleFirstInteraction);
```

**주의사항**:
- 모든 브라우저가 자동재생을 차단하지는 않음 (Chrome은 차단, Safari는 허용 등)
- 유저가 한 번이라도 클릭하면 모든 소리 재생 가능
- 모바일에서는 더 엄격한 제약이 있음

#### 2️⃣ 타이핑 효과음 재생

**목표**: 사용자가 아이디/비밀번호 입력할 때마다 "토도독" 소리

**구현**:
```typescript
const handleTyping = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
  // 상태 업데이트
  if (field === 'username') setUsername(e.target.value);
  else setPassword(e.target.value);

  // 효과음 재생
  if (sfxTypingRef.current) {
    // ⚠️ 중요: currentTime을 0으로 리셋
    // (키를 빠르게 누르면 효과음이 끝나기 전에 다시 재생되는 것 방지)
    sfxTypingRef.current.currentTime = 0;
    sfxTypingRef.current.play().catch(() => {
      // 재생 실패 시 조용히 무시
    });
  }
};
```

**선택사항: 쓰로틀링 (고급)**
```typescript
// 너무 많은 이벤트 발생 방지 (매초 1회 정도만 재생)
const lastTypingSoundTime = useRef<number>(0);

const handleTyping = (...) => {
  const now = Date.now();
  if (now - lastTypingSoundTime.current > 100) { // 100ms 이상 떨어져야 재생
    sfxTypingRef.current?.play();
    lastTypingSoundTime.current = now;
  }
};
```

#### 3️⃣ 클릭 효과음 재생

**목표**: "출발하기" 버튼 클릭 시 "띠링" 확인음

**구현**:
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // 💡 버튼 클릭 피드백: 가장 첫 번째로 효과음 재생
  if (sfxClickRef.current) {
    sfxClickRef.current.currentTime = 0;
    sfxClickRef.current.play().catch(() => {});
  }

  // 이후 로그인 로직 진행...
  setIsLoading(true);
  // ... 백엔드 호출 ...
};
```

**중요**: 버튼을 눌렀을 때 **즉시** 소리가 나야 함. 응답 대기 중에 나면 X

#### 4️⃣ NPC 환영 음성 (선택사항)

**목표**: 페이지 진입 시 로드리가 "어서오세요!" 짧은 음성

**구현** (고급):
```typescript
useEffect(() => {
  // 페이지 로드 후 1.5초 뒤에 환영 음성 재생
  const timer = setTimeout(() => {
    const welcomeAudio = new Audio('/assets/sfx_npc_welcome.wav');
    welcomeAudio.play().catch(() => {});
  }, 1500);

  return () => clearTimeout(timer);
}, []);
```

---

## 7. 파일 구조 및 배치 (File Structure)

```
frontend/
├── public/
│   ├── assets/                           ← 에셋 폴더
│   │   ├── bg_airport_counter.jpg       (배경)
│   │   ├── npc_orville.png              (캐릭터)
│   │   ├── bgm_airport.mp3              (배경음악)
│   │   ├── sfx_typing.wav               (타이핑 효과음)
│   │   └── sfx_click_confirm.wav        (클릭 효과음)
│   └── index.html
│
├── src/
│   ├── pages/
│   │   └── LoginPage.tsx                ← 메인 엔트리 페이지 (완전 구현)
│   │
│   ├── styles/ (선택사항)
│   │   └── globals.css                  (전역 스타일)
│   │
│   ├── App.tsx                          (LoginPage 렌더링)
│   ├── index.tsx
│   └── ...
│
├── tailwind.config.js                   (커스텀 테마 설정)
├── package.json
└── ...
```

**작성 순서** (추천):
1. `public/assets/` 안에 모든 에셋 배치
2. `tailwind.config.js` 수정 (색상, 애니메이션)
3. `LoginPage.tsx` 작성 (슈도 코드 참고)
4. 오디오 연결 테스트
5. 반응형 디자인 테스트

---

## 8. 구현 단계별 체크리스트 (Implementation Checklist)

구현 시 다음 순서대로 진행하면서 각 항목을 체크하면 된다.

### Phase 1: 준비 단계
- [ ] 에셋 준비 (이미지 4개, 오디오 3개 최소)
- [ ] 프로젝트 구조 확인 (`frontend/src/pages/`, `public/assets/` 폴더 생성)
- [ ] Tailwind CSS 설정 수정 (커스텀 색상, 애니메이션)

### Phase 2: 레이아웃 기본 구조
- [ ] `LoginPage.tsx` 파일 생성
- [ ] 배경 이미지를 전체 화면에 표시
- [ ] 임시 색상 박스로 NPC 위치와 폼 위치 확인 (Z-Index 테스트)
- [ ] 브라우저에서 정상 표시 확인

### Phase 3: NPC 로드리 배치
- [ ] `npc_orville.png` 이미지 로드
- [ ] 임시 박스를 실제 이미지로 교체
- [ ] 숨쉬기 애니메이션 클래스 적용 (`animate-npc-breathe`)
- [ ] 대화창 박스 스타일 적용

### Phase 4: 로그인 폼 구현
- [ ] 여권/탑승권 스타일 폼 컨테이너 작성
- [ ] 아이디 입력 필드 작성 (아이콘 + input)
- [ ] 비밀번호 입력 필드 작성 (아이콘 + input)
- [ ] 출발 버튼 작성 (3D 그림자, 호버/클릭 효과)
- [ ] 폼 전체 호버 회전 효과 추가 (`-rotate-1` → `hover:-rotate-0`)

### Phase 5: 오디오 연결
- [ ] `useRef`로 3개의 오디오 요소 생성 (BGM, 타이핑음, 클릭음)
- [ ] `useEffect`에서 첫 클릭 시 BGM 재생 로직 구현
- [ ] Input `onChange` 이벤트에 타이핑음 연결
- [ ] 버튼 `onClick`에 클릭음 연결
- [ ] 브라우저 개발자 도구에서 오디오 요소 확인

### Phase 6: 상태 관리 및 폼 연결
- [ ] `useState`로 username, password 상태 관리
- [ ] Input 필드와 상태 값 연결 (value, onChange)
- [ ] 버튼 클릭 시 백엔드 API 호출 (로그인 로직)
- [ ] 로딩 상태 관리 (isLoading)
- [ ] 버튼 `disabled` 상태와 로딩 애니메이션

### Phase 7: 반응형 디자인
- [ ] 1400px 이상: 원본 100% 크기
- [ ] 1200~1400px: 85% 스케일
- [ ] 768~1200px: 70% 스케일 (태블릿)
- [ ] 480~768px: 60% 스케일 (모바일)
- [ ] <480px: 55% 스케일 (작은 모바일)
- [ ] 각 해상도에서 레이아웃 깨짐 확인

### Phase 8: 최종 테스트
- [ ] 데스크톱 Chrome/Firefox/Safari에서 테스트
- [ ] 모바일 기기(iOS/Android)에서 테스트
- [ ] 오디오 자동재생 정책 확인
- [ ] 입력 필드 포커스 색상 확인
- [ ] 버튼 클릭 피드백 확인 (효과음 + 애니메이션)

### Phase 9: 접근성 및 SEO
- [ ] `alt` 텍스트 추가 (이미지)
- [ ] 폼 라벨과 input 연결 (htmlFor)
- [ ] 키보드 네비게이션 테스트 (Tab 키)
- [ ] 시각 장애인 대응 (스크린 리더 테스트)

### Phase 10: 최적화
- [ ] 이미지 파일 크기 최소화 (1920x1080 이미지도 200KB 이하 목표)
- [ ] 오디오 파일 압축 (MP3 128kbps, WAV는 경량 버전)
- [ ] Lighthouse 점수 확인 (Performance, Accessibility, Best Practices)
- [ ] 로딩 시간 측정 및 개선

---

## 9. 개발 팁 및 트러블슈팅 (Development Tips & Troubleshooting)

### 🐛 자주 하는 실수

#### 문제 1: "Cannot GET /assets/..."
```
원인: public/assets/ 폴더에 파일이 없음
해결:
1. frontend/public/assets/ 폴더 생성 확인
2. 파일명 정확하게 입력 (대소문자 주의)
3. 개발 서버 재시작 (npm start)
```

#### 문제 2: 오디오가 재생 안 됨
```
원인: 브라우저 자동재생 정책
해결:
1. 첫 클릭 이후에 재생되도록 로직 수정
2. 콘솔에서 에러 메시지 확인
3. .play().catch(err => console.log(err))로 에러 확인
```

#### 문제 3: 이미지가 깜빡임
```
원인: 배경 이미지가 로드 전에 렌더링됨
해결:
1. <img> 태그 대신 CSS background-image 사용
2. 또는 <img> 앞에 placeholder 추가
```

#### 문제 4: 반응형 디자인 깨짐
```
원인: Tailwind breakpoint 미적용
해결:
1. tailwind.config.js 설정 확인
2. 브라우저 DevTools에서 반응형 모드로 테스트
3. transform: scale() 사용 시 transform-gpu 추가
```

### 💡 개발 팁

#### Tip 1: 개발 중 에셋 없을 때
```typescript
// 임시로 배경색 사용
<div className="bg-dal-blue" />
// → 나중에 bg-cover로 변경
```

#### Tip 2: 오디오 볼륨 조절
```typescript
// ref를 통해 볼륨 조절 가능
bgmAudioRef.current.volume = 0.5; // 0~1 범위
```

#### Tip 3: 타입스크립트 안전성
```typescript
// ❌ 위험
const play = () => bgmAudioRef.current.play();

// ✅ 안전
const play = () => {
  if (bgmAudioRef.current) {
    bgmAudioRef.current.play();
  }
};

// ✨ 최고의 방법
const play = () => bgmAudioRef.current?.play();
```

#### Tip 4: CSS 디버깅
```css
/* 임시로 모든 요소에 테두리 추가 (레이아웃 확인) */
* { border: 1px solid red !important; }
```

---

## 10. 테스트 케이스 (Test Cases)

페이지가 완성되었을 때 다음 항목들을 확인해야 한다.

### 10.1 기능 테스트

| # | 테스트 항목 | 예상 결과 | 완료 |
|---|-----------|---------|------|
| 1 | 페이지 로드 | 배경 이미지 + NPC 표시 | ☐ |
| 2 | BGM 자동재생 | 클릭 이후 음악 재생 | ☐ |
| 3 | 타이핑 | Input 필드에 입력 가능 | ☐ |
| 4 | 타이핑음 | 각 키 입력 시 "토도독" 소리 | ☐ |
| 5 | 아이디 입력 | 입력 필드에 아이디 입력 가능 | ☐ |
| 6 | 비번 입력 | 입력 필드에 비번 입력 가능 (●●●) | ☐ |
| 7 | 버튼 호버 | 마우스 올릴 때 버튼 위로 올라옴 | ☐ |
| 8 | 버튼 클릭 | 클릭 시 "띠링" 소리 + 버튼 눌림 | ☐ |
| 9 | 유효성 검사 | 빈 필드로 로그인 시 경고 | ☐ |
| 10 | 로딩 상태 | 로그인 중 버튼 비활성화 + 맥박 애니메이션 | ☐ |

### 10.2 애니메이션 테스트

| # | 애니메이션 | 예상 동작 | 완료 |
|---|-----------|---------|------|
| 1 | NPC 숨쉬기 | 3초 주기로 미세하게 상하 움직임 | ☐ |
| 2 | 버튼 호버 | 위로 2px 올라오고 그림자 감소 | ☐ |
| 3 | 버튼 클릭 | 아래로 눌리는 듯한 느낌 (translate-y-2) | ☐ |
| 4 | 입력 포커스 | 테두리색이 노란색으로 변함 | ☐ |
| 5 | 로딩 | 버튼이 깜빡임 (pulse) | ☐ |

### 10.3 반응형 디자인 테스트

| 해상도 | 레이아웃 | 폰트 크기 | 완료 |
|--------|---------|---------|------|
| 2560px (4K) | 원본 크기 | 정상 | ☐ |
| 1920px (FHD) | 원본 크기 | 정상 | ☐ |
| 1400px | 85% 스케일 | 가독성 유지 | ☐ |
| 1024px (태블릿) | 70% 스케일 | 가독성 유지 | ☐ |
| 768px (태블릿) | 65% 스케일 | 가독성 유지 | ☐ |
| 480px (모바일) | 55% 스케일 | 모바일 최적화 | ☐ |
| 360px (작은 모바일) | 50% 스케일 | 레이아웃 깨짐 없음 | ☐ |

### 10.4 브라우저 호환성 테스트

| 브라우저 | 버전 | 오디오 | 레이아웃 | 애니메이션 | 완료 |
|---------|------|--------|---------|-----------|------|
| Chrome | 최신 | ✓ | ✓ | ✓ | ☐ |
| Firefox | 최신 | ✓ | ✓ | ✓ | ☐ |
| Safari | 최신 | ✓ | ✓ | ✓ | ☐ |
| Edge | 최신 | ✓ | ✓ | ✓ | ☐ |
| iOS Safari | 최신 | ⚠️ | ✓ | ✓ | ☐ |
| Android Chrome | 최신 | ✓ | ✓ | ✓ | ☐ |

> ⚠️ 주의: iOS Safari는 오디오 자동재생 제약이 가장 심함

### 10.5 접근성 테스트

| # | 항목 | 예상 결과 | 완료 |
|---|------|---------|------|
| 1 | 이미지 alt 텍스트 | 모든 img에 alt 속성 있음 | ☐ |
| 2 | 폼 라벨 | label → input 연결됨 | ☐ |
| 3 | 키보드 네비게이션 | Tab 키로 모든 요소 접근 가능 | ☐ |
| 4 | 포커스 표시 | 포커스된 요소가 명확하게 보임 | ☐ |
| 5 | 색상 대비 | WCAG AA 기준 만족 | ☐ |
| 6 | 스크린 리더 | VoiceOver/NVDA에서 읽음 | ☐ |

---

## 11. 배포 및 성능 최적화 (Deployment & Performance)

### 11.1 이미지 최적화

```bash
# 이미지 압축 (Mac/Linux)
# 배경 이미지: 1920x1080 → ~150-200KB (JPEG, quality 80)
convert bg_airport_counter.png -quality 80 -resize 1920x1080 bg_airport_counter.jpg

# 캐릭터 이미지: PNG 유지 (투명 배경)
# 최대 300KB 이하
```

### 11.2 오디오 최적화

```bash
# MP3 압축 (BGM)
# 128kbps 스테레오 권장
ffmpeg -i bgm_airport.wav -b:a 128k bgm_airport.mp3

# WAV 경량화 (효과음)
# 44.1kHz, 모노 권장
ffmpeg -i sfx_typing.wav -ar 44100 -ac 1 sfx_typing_optimized.wav
```

### 11.3 Lighthouse 점수 목표

| 항목 | 목표 점수 | 설명 |
|------|---------|------|
| Performance | 80+ | 로딩 시간, 애니메이션 부드러움 |
| Accessibility | 90+ | 접근성 준수 |
| Best Practices | 85+ | 보안, 표준 준수 |
| SEO | 90+ | 메타 태그, 구조화된 데이터 |

---

## 12. 참고 자료 및 외부 링크

### 공식 문서
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HTML5 Audio 요소](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)

### 동물의 숲 참고 자료
- [Animal Crossing 공식 위키](https://animalcrossing.fandom.com)
- [DAL Airline 캐릭터](https://animalcrossing.fandom.com/wiki/Dodo_Airlines)
- [Orville 캐릭터](https://animalcrossing.fandom.com/wiki/Orville)

### 디자인 영감
- [Figma Animal Crossing UI Kit](https://www.figma.com) (검색)
- [CSS Tricks](https://css-tricks.com)
- [MDN Web Docs](https://developer.mozilla.org)

---

## 📝 최종 체크리스트 (Before Deployment)

배포 전 반드시 확인해야 할 사항:

```
[ ] 모든 에셋이 public/assets/ 에 있는가?
[ ] tailwind.config.js 수정이 완료되었는가?
[ ] LoginPage.tsx가 모든 애니메이션/오디오 로직을 포함하는가?
[ ] 최소 3가지 브라우저에서 테스트했는가?
[ ] 모바일(360px, 768px, 1024px) 해상도에서 테스트했는가?
[ ] 모든 오디오가 정상 재생되는가? (자동재생 정책 포함)
[ ] 폼 유효성 검사가 작동하는가?
[ ] 로그인 API가 백엔드와 연결되었는가?
[ ] 에러 핸들링이 적절히 되어있는가?
[ ] 콘솔에 에러가 없는가?
[ ] Lighthouse 점수가 목표를 만족하는가?
[ ] 마지막으로 전체 플로우를 한 번 더 테스트했는가?
```

---

## 👨‍💻 개발자 가이드 마무리

이 문서는 **설계도이자 체크리스트**입니다.

개발할 때:
1. **Section 5 (슈도 코드)** 를 기본 뼈대로 사용
2. **Section 6 (인터랙션 명세)** 를 참고하며 각 기능 구현
3. **Section 8 (체크리스트)** 로 진행 상황 추적
4. **Section 10 (테스트 케이스)** 로 최종 검증

**질문이나 이해가 안 가는 부분이 있으면, 슈도 코드와 예제를 다시 읽으면 대부분 해결됩니다.**

Happy Coding! 🚀

---

**문서 버전**: 1.0
**마지막 수정**: 2025.12.01
**작성자**: Nook Coding Platform Design Team
