# Animal Forest Coding 🦝

**동물의 숲 테마의 Java 교육용 프로그래밍 학습 플랫폼**

> 너굴이와 함께 Java를 배우며 무인도를 발전시키세요!
> 코드를 작성하면 게임 속 내 섬이 실시간으로 변합니다.

---

## 🚀 빠른 시작

### 개발 환경 시작

```bash
# 백엔드 (Java 컴파일러 및 실행 엔진)
cd backend
npm install
npm run dev

# 프론트엔드 (게임 클라이언트)
cd frontend
npm install
npm start
```

**기본 URL**: http://localhost:3000

---

## 📚 문서

### 🎯 가장 먼저 읽어야 할 문서

| 대상 | 문서 | 소요시간 |
|------|------|---------|
| **모두** | [**마스터 인덱스**](docs/00_DOCUMENTATION_INDEX.md) | 5분 |
| **새 개발자** | [기술 아키텍처 (Java)](docs/01_CORE_TECHNICAL_ARCHITECTURE.md) | 20분 |
| **테스트** | [종합 테스트 전략](docs/02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md) | 10분 |

---

## 🏗️ 프로젝트 구조

```
animal-forest-coding/
├── backend/                    # Express.js + Java Execution Service
│   ├── src/
│   │   ├── services/          
│   │   │   └── JavaExecutionService.ts  # Java 코드 컴파일/실행 (격리 환경)
│   └── package.json
│
├── frontend/                   # React + TypeScript Game Client
│   ├── src/
│   │   ├── components/       # 게임 UI (DialogueBox, Sprite 등)
│   │   ├── pages/            # StoryPage, IDEPage
│   └── public/               # Assets (Images, story.html)
│
├── tests/                      # Testing
│   ├── unit/                 # Jest Unit Tests
│   └── e2e/                  # Playwright E2E Tests
│
└── docs/                       # 📖 프로젝트 문서 (Java Architecture)
```

---

## 🎯 핵심 기능

### 🎓 Java 학습 미션 시스템
- **Java 기초**: 변수(int/double), 타입 캐스팅(Casting), 연산자
- **제어문**: 조건문(if/else), 반복문(for/while)으로 게임 로직 제어
- **OOP**: 클래스와 객체로 주민 상호작용 구현

### 🎮 Gamification (게임화)
- **동물의 숲 테마 UI**: 너굴 대사창, BGM, 효과음
- **실시간 피드백**: 코드가 성공하면 섬의 상태(벨, 인벤토리)가 즉시 변경
- **몰입형 스토리**: 무인도 이주 패키지부터 대출금 상환까지

### 🔧 기술 스택
- **Frontend**: React, TypeScript, Redux Toolkit
- **Backend**: Express.js, Node.js (Java Wrapper)
- **Execution**: **Server-side Java Execution** (JDK 17+)
- **Security**: Strict Input Validation & Docker Isolation (Planned)
- **Database**: SQLite (Dev) -> PostgreSQL (Prod)

---

## 🚀 아키텍처: 왜 Server-side Java인가?

초기 기획 단계의 Pyodide(Client-side Python)는 교육 목표(Java OOP 학습)와 맞지 않아 폐기되었습니다.
본 프로젝트는 **실제 엔터프라이즈 환경**과 유사한 **서버 사이드 Java 컴파일 아키텍처**를 채택했습니다.

1. **User Code** (Frontend IDE)
2. **Secure Transmission** (HTTPS)
3. **Server Validation** (Express Middleware)
4. **Execution Engine** (Java Process with Security Manager/Docker)
5. **Game State Update** (DB Sync)

---

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# E2E 테스트 (Playwright)
npm run e2e
```

---

## 📝 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🦝 Created by Antigravity
**Last Updated**: 2025-12-08
