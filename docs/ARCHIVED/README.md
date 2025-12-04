# 🦁 Animal Forest Coding - 동물 숲 코딩 학습 플랫폼

> 동물 친구들과 함께하는 재미있는 코딩 학습 플랫폼

## 🎯 프로젝트 개요

**Animal Forest Coding**은 Tom Nook, Isabelle, Timmy & Tommy와 같은 동물 숲(Animal Crossing) 캐릭터들이 코딩 개념을 재미있게 설명해주는 교육용 웹 플랫폼입니다. 각 캐릭터는 고유한 목소리(Animalese TTS)로 학습 내용을 전달합니다.

### 🌟 핵심 기능

- 🎨 **동물 캐릭터 선택**: 다양한 동물 숲 캐릭터 중 선택
- 🎙️ **Animalese TTS**: 캐릭터별 고유한 음성 생성
- 📚 **코딩 콘텐츠**: 초급부터 고급까지 다양한 코딩 개념
- 🖼️ **시각적 학습**: 이미지와 함께하는 직관적 학습
- 📱 **반응형 디자인**: 모든 기기에서 완벽하게 작동

## 🚀 빠른 시작

### 시스템 요구사항
- Node.js 16.x 이상
- npm 7.x 이상
- 최신 웹 브라우저

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd animal-forest-coding

# 백엔드 설치
cd backend
npm install
npm run dev

# 새로운 터미널에서 프론트엔드 설치
cd frontend
npm install
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하면 완료!

## 📋 프로젝트 구조

```
animal-forest-coding/
├── backend/                 # Express.js 백엔드
│   ├── src/
│   │   ├── services/       # 비즈니스 로직
│   │   ├── routes/         # API 라우트
│   │   ├── middleware/     # 미들웨어
│   │   └── server.ts       # 메인 서버
│   └── package.json
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지
│   │   ├── services/      # API 클라이언트
│   │   └── App.tsx        # 메인 앱
│   └── package.json
├── docs/                  # 프로젝트 문서
│   ├── SDD.md            # 시스템 설계 문서
│   ├── TDD.md            # 테스트 설계 문서
│   ├── DEVELOPMENT.md    # 개발 가이드
│   ├── API.md            # API 문서
│   └── DOCUMENTATION_INDEX.md
└── README.md             # 이 파일
```

## 🛠️ 기술 스택

### 백엔드
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **API**: REST API
- **Testing**: Jest

### 프론트엔드
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library

### DevOps
- **Build Tool**: npm/webpack
- **Version Control**: Git
- **Database**: File System (초기 단계)

## 📚 문서

자세한 정보는 다음 문서들을 참고하세요:

| 문서 | 설명 | 대상 |
|------|------|------|
| [SDD.md](docs/SDD.md) | 시스템 아키텍처 및 설계 | 아키텍트, 리드 개발자 |
| [TDD.md](docs/TDD.md) | 테스트 전략 및 케이스 | QA 엔지니어, 개발자 |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | 개발 환경 설정 및 가이드 | 개발자 |
| [API.md](docs/API.md) | REST API 명세 | 백엔드/프론트엔드 개발자 |

## 🎓 주요 학습 콘텐츠

### 1. 변수와 데이터 타입
- 변수 선언 및 초기화
- JavaScript 데이터 타입 이해
- 타입 변환 및 강제 타입 변환

### 2. 제어 흐름
- if/else 조건문
- for, while, do-while 반복문
- switch 문

### 3. 함수와 스코프
- 함수 선언 및 호출
- 매개변수와 반환값
- 스코프와 클로저

### 4. 객체와 배열
- 객체 생성 및 접근
- 배열 메서드 (map, filter, reduce)
- JSON 데이터 처리

### 5. 비동기 프로그래밍
- Promise와 async/await
- 콜백 함수
- 에러 처리

## 🎮 사용 예제

### 캐릭터 선택
```javascript
// 캐릭터 선택 및 콘텐츠 로드
const character = "Tom Nook";
const topic = "variables";
const { audio, image, content } = await fetchContent(character, topic);
```

### 콘텐츠 재생
```javascript
// Animalese 음성으로 콘텐츠 재생
const player = new AudioPlayer(audio);
player.play();
```

## 🧪 테스트

### 백엔드 테스트 실행
```bash
cd backend
npm test
```

### 프론트엔드 테스트 실행
```bash
cd frontend
npm test
```

### 통합 테스트
```bash
npm run test:integration
```

## 📊 API 엔드포인트

### 주요 엔드포인트
- `GET /api/characters` - 사용 가능한 캐릭터 목록
- `GET /api/content/:character/:topic` - 특정 캐릭터와 주제의 콘텐츠
- `GET /api/images/:imageId` - 이미지 조회
- `POST /api/tts` - Animalese 음성 생성
- `GET /api/progress` - 사용자 학습 진행률

자세한 API 문서는 [API.md](docs/API.md)를 참고하세요.

## 🚀 배포

### Docker를 사용한 배포
```bash
docker-compose up -d
```

### 클라우드 배포 옵션
- **AWS**: EC2, ECS, Lambda
- **Google Cloud**: App Engine, Cloud Run
- **Azure**: App Service, Container Instances
- **Heroku**: Git push 배포

자세한 배포 가이드는 [DEVELOPMENT.md](docs/DEVELOPMENT.md) 참고

## 🐛 문제 해결

### 백엔드 연결 안 됨
```bash
# 포트 확인
lsof -i :5000

# 로그 확인
tail -f backend/logs/app.log
```

### 프론트엔드 로드 안 됨
```bash
# 캐시 제거
rm -rf node_modules/.cache

# 재설치
npm install
npm start
```

### 음성 재생 안 됨
- 브라우저 오디오 권한 확인
- 스피커 연결 확인
- 브라우저 콘솔에서 에러 메시지 확인

더 많은 문제 해결 방법은 [DEVELOPMENT.md](docs/DEVELOPMENT.md) 참고

## 🔒 보안

- ✅ 모든 API 입력값 검증
- ✅ 속도 제한 (Rate Limiting)
- ✅ CORS 설정
- ✅ 에러 메시지 보안 필터링
- ✅ 파일 경로 sanitization

## 📈 로드맵

### Phase 1 (현재)
- [x] 기본 아키텍처 설계
- [x] 문서 작성
- [ ] 백엔드 구현
- [ ] 프론트엔드 구현
- [ ] 초기 테스트

### Phase 2
- [ ] 데이터베이스 통합 (PostgreSQL)
- [ ] 캐싱 시스템 (Redis)
- [ ] 사용자 인증
- [ ] 학습 진행률 추적

### Phase 3
- [ ] 마이크로서비스 아키텍처
- [ ] 실시간 기능 (WebSocket)
- [ ] 모바일 앱

### Phase 4
- [ ] 글로벌 CDN
- [ ] AI 기반 콘텐츠 생성
- [ ] 게이미피케이션

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 지원

질문이나 문제가 있으시면:
- 📧 Email: support@animalforestcoding.dev
- 💬 Issues: GitHub Issues
- 📖 Docs: [전체 문서](docs/)

## 🙏 감사의 말

- 🎮 Nintendo - Animal Crossing 영감
- 🐍 Python Community - 코드 샘플
- ⚛️ React Community - 프론트엔드 도구

---

**마지막 업데이트**: 2024-11-30
**상태**: 개발 준비 완료 🚀
**버전**: 0.1.0-alpha
