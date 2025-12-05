# Java IDE E2E Testing Plan - 실제 증거 기반 검증

**작성일**: 2025-12-05
**목표**: 실제 사용자 시나리오를 재현하고 스크린샷으로 증명

---

## 📋 테스트 실행 계획

### Phase 1: 테스트 환경 설정
```bash
# 1. 백엔드 시작
cd backend
npm run dev

# 2. 프론트엔드 시작 (다른 터미널)
cd frontend
npm start

# 3. 스크린샷 디렉토리 생성
mkdir -p test-screenshots

# 4. 데이터베이스 초기화 (필요시)
rm -f backend/data/progression.db*
```

### Phase 2: Playwright 테스트 실행
```bash
# 빠른 테스트 (스크린샷 + MD5 검증)
npx playwright test e2e/java-ide-quick-test.spec.ts --headed

# 또는 전체 포괄적 테스트
npx playwright test e2e/java-ide-comprehensive.spec.ts --headed
```

### Phase 3: 결과 검증
```bash
# 생성된 스크린샷 확인
ls -la test-screenshots/

# 해시 리포트 확인
cat test-screenshots/hash-report.json

# 각 스크린샷 MD5 확인
md5sum test-screenshots/*.png
```

---

## 🎯 테스트 케이스 요약

### 유즈 케이스 (5개)
| UC # | 이름 | 목표 | 기대결과 |
|------|------|------|---------|
| UC-1 | 초보자가 첫 미션 완료 | 변수 미션 통과 | 500점 획득 |
| UC-2 | 컴파일 오류 수정 | 오류 수정 후 성공 | 정상 실행 |
| UC-3 | 모든 미션 완료 | 6개 미션 모두 실행 | 3,700점 획득 |
| UC-4 | ArrayList 복잡 작업 | 컬렉션 사용 | 올바른 출력 |
| UC-5 | 보안 위반 시도 | System.exit 차단 | 오류 표시 |

### 테스트 케이스 (10개)
| TC # | 설명 | 입력 | 기대 출력 |
|------|------|------|----------|
| TC-1 | 정상 실행 | 변수 출력 | "10" |
| TC-2 | ArrayList | add/get/size | "사과\n2" |
| TC-3 | 컴파일 오류 | 세미콜론 누락 | ';' expected |
| TC-4 | 보안: System.exit | exit 호출 | Blocked |
| TC-5 | 보안: Runtime.exec | exec 호출 | Blocked |
| TC-6 | 보안: FileIO | FileOutputStream | Blocked |
| TC-7 | 미션 전환 | 선택 변경 | 코드 변경 |
| TC-8 | 탭 전환 | 미션→에디터→진행도 | 각 탭 표시 |
| TC-9 | 코드 초기화 | Reset 클릭 | 원본 복원 |
| TC-10 | 너굴 메시지 | 상황별 | 맞는 메시지 |

### 엣지 케이스 (10개)
| EC # | 설명 | 입력 | 기대 결과 |
|------|------|------|----------|
| EC-1 | 빈 코드 | "" | 컴파일 에러 |
| EC-2 | 대량 출력 | 1000줄 | 모두 캡처 |
| EC-3 | 무한 루프 | while(true) | 5초 timeout |
| EC-4 | Unicode | 한글 | 정상 출력 |
| EC-5 | 특수문자 | \n \t | 정상 처리 |
| EC-6 | 최대 크기 | 50KB | 실행 성공 |
| EC-7 | 초과 크기 | 51KB | 거부 |
| EC-8 | 연속 실행 | 빠른 클릭 | 중복 방지 |
| EC-9 | 뒤로 가기 | 브라우저 | 상태 복원 |
| EC-10 | 네트워크 지연 | 느린 망 | 정상 작동 |

---

## 📸 스크린샷 검증 전략

### 각 테스트마다 캡처
```
이전 상태 (Before) → 동작 → 이후 상태 (After)
```

### MD5 해시 검증
```
각 스크린샷 → MD5 계산 → 해시 비교 → 다른지 확인
```

### 스크린샷 네이밍 규칙
```
{TestType}_{TestNumber}_{Step}_{State}.png

예시:
- uc1_01_initial_page.png (UC-1 단계 1: 초기 페이지)
- tc3_02_error_message.png (TC-3 단계 2: 오류 메시지)
- ec4_01_korean_text.png (EC-4 단계 1: 한글 텍스트)
```

---

## ✅ 검증 체크리스트

### Phase 1: 테스트 정의 ✅
- [x] 5개 유즈케이스 정의
- [x] 10개 테스트케이스 정의
- [x] 10개 엣지케이스 정의
- [x] 테스트 케이스 문서화

### Phase 2: Playwright 테스트 작성 ✅
- [x] UC 시나리오 구현
- [x] TC 검증 로직 구현
- [x] EC 처리 구현
- [x] MD5 해시 계산 기능

### Phase 3: 테스트 실행 (준비완료)
- [ ] 서버 시작
- [ ] Playwright 테스트 실행
- [ ] 스크린샷 자동 캡처
- [ ] MD5 해시 자동 계산
- [ ] 리포트 생성

### Phase 4: 결과 검증 (준비완료)
- [ ] 스크린샷 시각적 검사
- [ ] MD5 해시 중복 검사
- [ ] 테스트 통과/실패 확인
- [ ] 최종 리포트 작성

---

## 🔍 검증 기준

### 통과 조건
1. **기능 검증**: 모든 주요 시나리오 작동
2. **UI 변화**: 각 단계에서 화면 변화 명확
3. **스크린샷**: 최소 20개 이상 캡처
4. **해시 검증**: 80% 이상 고유한 해시
5. **문서화**: 모든 결과 기록

### 실패 조건
1. 핵심 기능 미작동
2. 스크린샷 캡처 실패
3. 해시 중복 비율 20% 초과
4. 문서화 미흡

---

## 📊 예상 결과

### 스크린샷 개수
```
유즈케이스: 5 × 5-10단계 = 25-50개
테스트케이스: 10 × 2단계 = 20개
엣지케이스: 5개 (샘플)
─────────────────────────
총합: 50-75개 스크린샷
```

### MD5 해시 고유성
```
예상: 90% 이상 고유 (45-67개 고유)
이유: 각 단계마다 다른 상태 표시
```

### 테스트 실행 시간
```
빠른 테스트: 5-10분
전체 테스트: 30-60분
```

---

## 🚀 실행 순서

### Step 1: 환경 준비 (2분)
```bash
# 서버 시작
cd backend && npm run dev &
cd frontend && npm start &
sleep 10
```

### Step 2: 테스트 실행 (10-30분)
```bash
# 빠른 테스트부터 시작
npx playwright test e2e/java-ide-quick-test.spec.ts --headed

# 더 상세한 테스트
npx playwright test e2e/java-ide-comprehensive.spec.ts --headed
```

### Step 3: 결과 수집 (5분)
```bash
# 스크린샷 확인
ls -la test-screenshots/ | wc -l

# 해시 리포트 확인
cat test-screenshots/hash-report.json

# 최종 통계
find test-screenshots -name "*.png" | wc -l
```

### Step 4: 보고서 생성 (5분)
```bash
# 리포트 작성
# → JAVA_IDE_E2E_TEST_RESULTS.md 생성
```

---

## 📝 예상 출력 예시

### 테스트 실행 로그
```
🎯 Test 1: IDE 로드 및 초기 상태

📸 test1_ide_loaded.png
   IDE 페이지 로드 완료
   Hash: 3d7e8a2b9f4c1e6d5a8b7c9e
   Size: 245000 bytes

✅ Test 1 완료: IDE가 성공적으로 로드되었습니다.
```

### 해시 리포트 (JSON)
```json
{
  "timestamp": "2025-12-05T...",
  "totalScreenshots": 45,
  "uniqueHashes": 42,
  "duplicates": 3,
  "uniquenessRatio": 93.3,
  "verdict": "PASSED",
  "screenshots": [
    {
      "filename": "uc1_01_initial_page.png",
      "hash": "3d7e8a2b9f4c1e6d5a8b7c9e",
      "size": 245000
    }
  ]
}
```

---

## 🎯 최종 목표

이 E2E 테스트를 통해 다음을 **실제 증거로** 입증할 것:

✅ **Java IDE가 실제로 작동한다**
- 미션 로드
- 코드 실행
- 결과 표시
- 에러 처리

✅ **UI/UX가 명확하게 변한다**
- 각 단계마다 다른 스크린샷
- MD5 해시로 검증
- 사용자 상호작용 반영

✅ **모든 시나리오가 처리된다**
- 정상 케이스
- 에러 케이스
- 엣지 케이스

✅ **문서로 기록된다**
- 스크린샷 저장
- 해시 계산
- 리포트 생성
- 결과 공개

---

## 📞 Troubleshooting

### 문제: 스크린샷이 캡처되지 않음
**해결**:
1. 서버 실행 확인
2. Playwright 설치 확인: `npx playwright install`
3. 페이지 로드 대기 시간 증가

### 문제: 모든 스크린샷이 동일함
**원인**:
- 페이지 변경 없음
- 렌더링 실패
**해결**:
1. waitForTimeout() 증가
2. waitForLoadState() 사용
3. 브라우저 설정 확인

### 문제: 해시 비율이 낮음
**원인**:
- 불필요한 캡처
- 상태 변화 없음
**해결**:
1. 의미있는 상태변화만 캡처
2. 동작과 결과만 비교
3. 중간 단계 제거

---

## 결론

이 계획은 **단순 클레임이 아닌 실제 증거**를 제공합니다:
- 📸 눈에 보이는 스크린샷
- 🔐 변조 불가능한 MD5 해시
- 📋 자동으로 생성되는 리포트
- ✅ 재현 가능한 테스트

