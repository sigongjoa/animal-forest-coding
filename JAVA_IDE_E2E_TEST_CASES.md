# Java IDE E2E Test Cases - 실제 사용자 시나리오 기반

**목표**: Playwright로 실제 사용자 행동을 시뮬레이션하고 스크린샷으로 검증

---

## 📋 USE CASES (유즈케이스)

### UC-1: 초보자 학생이 첫 번째 미션 완료
**배경**: 학생이 처음 IDE를 사용하고 변수 미션을 완료하는 상황
**단계**:
1. IDE 페이지 로드
2. "미션" 탭 선택
3. "var-101: 변수 선언" 미션 선택
4. 코드 에디터 열기
5. 코드 실행
6. 성공 메시지 확인
7. "진행도" 탭에서 포인트 증가 확인

---

### UC-2: 사용자가 컴파일 오류 수정
**배경**: 학생이 코드에서 세미콜론을 빼먹고 오류를 수정하는 상황
**단계**:
1. 미션 선택 (if-104)
2. 의도적으로 잘못된 코드 입력
3. 실행 버튼 클릭
4. 컴파일 오류 메시지 확인
5. 코드 수정
6. 재실행
7. 성공 확인

---

### UC-3: 사용자가 모든 미션 완료 후 진행도 확인
**배경**: 학생이 여러 미션을 완료하고 진행도 대시보드를 확인
**단계**:
1. 6개 미션 모두 실행 (순차적)
2. 각 미션별 성공 확인
3. 총 포인트 계산 확인 (500+500+600+700+700+700 = 3,700)
4. 진행도 바 확인 (6/6 = 100%)
5. 완료 목록 확인

---

### UC-4: 사용자가 ArrayList 미션으로 복잡한 작업 수행
**배경**: 중급 학생이 ArrayList 미션에서 여러 작업 수행
**단계**:
1. list-106 미션 선택
2. ArrayList 생성
3. 여러 항목 추가
4. 인덱스로 접근
5. 크기 확인
6. 출력 결과 확인

---

### UC-5: 사용자가 보안 위반 코드 시도
**배경**: 학생이 System.exit() 같은 위험한 코드 시도
**단계**:
1. 임의 코드 에디터 열기
2. System.exit() 코드 입력
3. 실행 클릭
4. 보안 오류 메시지 확인
5. 오류 메시지 읽기

---

## 🧪 TEST CASES (테스트 케이스)

### TC-1: 정상 실행 - 간단한 변수 출력
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    int x = 10;
    System.out.println(x);
  }
}
```
**기대 결과**:
- 성공: true
- 출력: "10"
- 시간: < 5000ms
- UI: 초록색 성공 표시

---

### TC-2: 정상 실행 - ArrayList 작업
**입력**:
```java
import java.util.ArrayList;
public class Solution {
  public static void main(String[] args) {
    ArrayList<String> list = new ArrayList<>();
    list.add("사과");
    list.add("바나나");
    System.out.println(list.get(0));
    System.out.println(list.size());
  }
}
```
**기대 결과**:
- 성공: true
- 출력: "사과\n2"
- 포인트: +700

---

### TC-3: 컴파일 오류 - 세미콜론 누락
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    int x = 10
    System.out.println(x);
  }
}
```
**기대 결과**:
- 성공: false
- compilationError: "';' expected"
- UI: 빨간색 오류 표시
- 행 번호: 3

---

### TC-4: 보안 위반 - System.exit()
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    System.exit(0);
  }
}
```
**기대 결과**:
- 성공: false
- 오류: "Blocked pattern detected: System\.exit"
- 실행 안됨 (0ms)

---

### TC-5: 보안 위반 - Runtime.exec()
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    Runtime.getRuntime().exec("ls");
  }
}
```
**기대 결과**:
- 성공: false
- 오류: "Blocked pattern detected: Runtime\.getRuntime"

---

### TC-6: 보안 위반 - FileOutputStream
**입력**:
```java
import java.io.*;
public class Solution {
  public static void main(String[] args) throws Exception {
    FileOutputStream file = new FileOutputStream("test.txt");
  }
}
```
**기대 결과**:
- 성공: false
- 오류: "Blocked pattern detected: FileOutputStream"

---

### TC-7: 미션 선택 전환
**단계**:
1. var-101 선택 → 코드 변경
2. type-102 선택 → 에디터 코드 자동 변경
3. 원래 코드 확인 (초기값으로 돌아갔는지)
**기대 결과**:
- 미션 전환 시 코드가 올바르게 변경됨
- UI 업데이트 즉시 반영

---

### TC-8: 탭 전환 (미션 ↔ 에디터 ↔ 진행도)
**단계**:
1. 미션 탭 클릭 → 미션 목록 표시
2. 에디터 탭 클릭 → 코드 에디터 표시
3. 진행도 탭 클릭 → 진행 상황 표시
4. 탭 전환 확인
**기대 결과**:
- 각 탭이 정확한 콘텐츠 표시
- 탭 버튼 강조 표시 (active)

---

### TC-9: 코드 초기화 (Reset)
**단계**:
1. 미션 코드 수정
2. "초기화" 버튼 클릭
3. 원래 코드 복원 확인
**기대 결과**:
- 코드가 원래 startCode로 복원됨

---

### TC-10: 너굴 메시지 변화
**단계**:
1. IDE 로드 → 초기 메시지
2. 미션 선택 → 선택 메시지
3. 코드 실행 성공 → 축하 메시지
4. 코드 실행 실패 → 격려 메시지
**기대 결과**:
- 각 상황에 맞는 너굴 메시지 표시
- 메시지 자연스러운 변화

---

## 🔍 EDGE CASES (엣지 케이스)

### EC-1: 빈 코드 실행
**입력**: "" (빈 문자열)
**기대 결과**:
- 컴파일 오류 (클래스 정의 없음)

---

### EC-2: 매우 큰 출력
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    for (int i = 0; i < 1000; i++) {
      System.out.println("Line " + i);
    }
  }
}
```
**기대 결과**:
- 모든 출력 캡처
- 스크롤 가능

---

### EC-3: 무한 루프 (timeout)
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    while (true) {
      System.out.println("Loop");
    }
  }
}
```
**기대 결과**:
- 5초 후 timeout
- 오류 메시지 표시

---

### EC-4: Unicode 문자 (한글)
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    System.out.println("안녕하세요!");
    System.out.println("너굴");
  }
}
```
**기대 결과**:
- 한글 정상 출력

---

### EC-5: 특수 문자 포함
**입력**:
```java
public class Solution {
  public static void main(String[] args) {
    System.out.println("\"Hello\\nWorld\"");
    System.out.println("Tab\tSeparated");
  }
}
```
**기대 결과**:
- 특수 문자 정상 처리

---

### EC-6: 최대 크기 코드 (50KB)
**입력**: 정확히 50KB 코드
**기대 결과**:
- 컴파일 및 실행 정상

---

### EC-7: 초과 크기 코드 (51KB)
**입력**: 51KB 코드
**기대 결과**:
- 거부 오류: "Code size exceeds maximum limit"

---

### EC-8: 연속 실행 (클릭 스팸)
**단계**:
1. 실행 버튼 빠르게 연속 클릭
**기대 결과**:
- 중복 실행 방지
- 첫 번째 실행만 처리

---

### EC-9: 브라우저 뒤로 가기 후 복귀
**단계**:
1. IDE에서 코드 작성
2. 브라우저 뒤로 가기
3. 앞으로 가기
**기대 결과**:
- 상태 복원 또는 초기화 (어느 쪽이든 명확)

---

### EC-10: 네트워크 지연
**단계**:
1. 느린 네트워크 환경에서 코드 실행
**기대 결과**:
- Loading 상태 표시
- 결과 정상 반영

---

## 📸 SCREENSHOT VERIFICATION PLAN

각 테스트 케이스마다:
1. **Before 스크린샷**: 실행 전 상태
2. **After 스크린샷**: 실행 후 상태
3. **MD5 해시**: 두 스크린샷이 다른지 검증

### 스크린샷 목록
- ✅ TC-1: 변수 출력 (Before/After)
- ✅ TC-2: ArrayList (Before/After)
- ✅ TC-3: 컴파일 오류 (Before/After)
- ✅ TC-4: 보안 오류 (Before/After)
- ✅ TC-8: 탭 전환 (3개 탭 각각)
- ✅ UC-3: 진행도 증가 (시작/완료)

---

## ✅ VALIDATION CRITERIA

각 테스트는 다음을 확인:
1. **UI 변화**: 스크린샷으로 시각적 변화 확인
2. **메시지**: 너굴 메시지 정확성
3. **포인트**: 진행도 탭의 포인트 변화
4. **에러**: 오류 메시지 명확성
5. **시간**: 실행 시간 측정

---

## 🎯 SUCCESS CRITERIA

모든 테스트 통과 조건:
- [ ] 10개 TC 모두 통과
- [ ] 5개 EC 중 최소 3개 통과
- [ ] 모든 스크린샷 MD5 해시 다름 (변화 증명)
- [ ] UI 변화 시각적으로 명확
- [ ] 오류 메시지 사용자 친화적

