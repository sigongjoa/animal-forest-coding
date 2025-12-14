# 📘 AP CSA x 동물의 숲: 프로젝트 리부트 (Project Re-Boot)
**부제: '너굴 개발사(Nook Inc.)' 신입 엔지니어를 위한 시스템 복구 매뉴얼**

---

## 🚩 개요 (Overview)

### 1. 프로젝트 소개
현대 컴퓨터 과학 교육은 단순한 문법 암기를 넘어, 복잡한 문제 해결 능력을 요구합니다. 본 커리큘럼은 **2025 AP Computer Science A (AP CSA)** 평가 데이터를 기반으로 설계된 몰입형 교육 과정입니다. 학습자는 '너굴 개발사'의 신입 엔지니어가 되어, 버그(Glitch)로 인해 붕괴 위기에 처한 동물의 숲 세계를 객체 지향 프로그래밍(OOP) 지식으로 복구해야 합니다.

### 2. 교육 목표
- **추상적 개념의 시각화:** 변수, 제어문, 객체, 2차원 배열 등 AP CSA의 핵심 개념을 게임 내 구체적인 상황(경제, 낚시, 주민, 지형)과 연결하여 이해합니다.
- **취약점 정밀 타격:** 2025년 AP 시험에서 가장 낮은 정답률을 기록한 '2차원 배열 알고리즘'과 '객체 설계' 파트를 집중적으로 훈련합니다.
- **실전 코딩 습관 형성:** 디지털 시험(Bluebook) 환경에 맞춰 가독성 높은 코드 작성과 정확한 타이핑 습관을 기릅니다.

---

## 📂 Unit 1. 경제 시스템 복구: 변수와 데이터 타입
> **Story:** 너굴 뱅크의 전산망이 마비되었습니다. 대출금 이자가 소수점으로 쪼개져 데이터베이스 오류를 일으키고, 무 주식 대박으로 인한 정수 오버플로우가 발생해 은행 잔고가 음수가 되는 사태를 수습해야 합니다.

### 1.1 벨(Bell)의 정체성 (Primitive Types)
- **AP Topic:** 1.1 Why Programming? / 1.2 Variables and Data Types
- **Mission:** 화폐 단위인 `Bell`을 정의하고 올바른 데이터 타입을 선택합니다.
- **Key Concept:**
  - `int`: 셀 수 있는 화폐 (벨). 소수점이 없어야 함.
  - `double`: 이자율(0.5%)과 같이 정밀한 계산이 필요한 수치.

### 1.2 너굴의 "내림" 정책 (Casting & Expressions)
- **AP Topic:** 1.3 Expressions / 1.5 Casting
- **Mission:** 이자 계산 시 발생하는 소수점을 처리합니다.
- **Scenario:** 10,550벨 * 0.5% = 52.75벨. 이것을 어떻게 지급할 것인가?
- **Code Solution:**
  ```java
  double interest = currentBalance * 0.005; // 52.75
  int payout = (int) interest; // 52 (강제 형변환으로 소수점 버림)
  // 너굴은 0.75벨조차 주지 않는다!
  ```

### 1.3 무 주식 대폭락 (Integer Overflow)
- **AP Topic:** 1.5.B Integer overflow logic
- **Mission:** 정수형 변수의 한계를 이해하고 오버플로우를 방지합니다.
- **Scenario:** 무 4,000,000개 * 600벨 = 2,400,000,000벨.
  - `int`의 최대값(약 21억)을 초과하여 음수(빚)로 변하는 버그 발생.
- **Solution:** 큰 금액을 다룰 때의 예외 처리 또는 데이터 타입의 한계 인식 교육.

---

## 📂 Unit 2. 낚시 대회 디버깅: 제어 구조와 논리
> **Story:** 저스틴이 주최하는 낚시 대회의 타이머가 멈추지 않는 무한 루프에 빠졌습니다. 참가 자격이 없는 플레이어를 입구에서 차단하고, 물고기 판별 AI의 오류를 수정하여 대회를 정상화해야 합니다.

### 2.1 입구 컷 알고리즘 (Boolean Logic)
- **AP Topic:** 2.1 Boolean Expressions / 2.6 De Morgan's Laws
- **Mission:** 대회 참가 자격을 논리식으로 구현합니다.
- **Scenario:** 참가비(500벨)가 있고, 주머니가 비어있어야 함.
- **Code Solution:**
  ```java
  boolean hasFee = balance >= 500;
  boolean isPocketFull = pocket.size() >= 20;

  // 참가 가능
  if (hasFee && !isPocketFull) { ... }
  
  // 참가 불가 (드 모르간 법칙 적용)
  // !(hasFee && !isPocketFull) == (!hasFee || isPocketFull)
  ```

### 2.2 끝나지 않는 대회 (Iteration)
- **AP Topic:** 3.1 Boolean Expressions / 4.1 While Loops
- **Mission:** 정확한 타이머 종료 조건을 설정합니다.
- **Scenario:** `time > 0` vs `time >= 0`. 0초에 낚싯대를 던질 수 있는가? "Off-by-one" 오류 수정.

### 2.3 도미인가 농어인가? (String Comparison)
- **AP Topic:** 2.10 Comparing Objects
- **Mission:** 물고기 이름을 올바르게 비교하여 점수를 매깁니다.
- **Critical Bug:** `if (fishName == "Sea Bass")` (X) -> 점수 집계 누락.
- **Fix:** `if (fishName.equals("Sea Bass"))` (O) -> 문자열 내용 비교.

---

## 📂 Unit 3. 주민 자아 복원: 객체 지향 프로그래밍(OOP)
> **Story:** 해커의 공격으로 주민들의 기억(데이터)이 뒤섞였습니다. '잭슨'이 '운동광' 성격으로 변하거나, 친밀도가 멋대로 조작되고 있습니다. 클래스라는 설계도를 다시 그려 주민들의 정체성을 보호해야 합니다.

### 3.1 주민 등록부 설계 (Class Design)
- **AP Topic:** 5.1 Anatomy of a Class / 5.2 Constructors
- **Mission:** `Villager` 클래스를 정의합니다.
- **Structure:**
  - **State (상태):** `name`, `species`, `personality`, `friendshipLevel`
  - **Behavior (행동):** `talk()`, `gift()`, `moveOut()`

### 3.2 기억 잠그기 (Encapsulation)
- **AP Topic:** 5.4 Accessor Methods / 5.5 Mutator Methods
- **Mission:** 데이터 무결성을 위해 캡슐화를 적용합니다.
- **Code Solution:**
  ```java
  public class Villager {
      private int friendshipLevel; // private으로 잠금!
      
      public void gift(String item) {
          // 정해진 규칙(메서드)을 통해서만 친밀도 상승
          this.friendshipLevel++;
      }
  }
  ```

### 3.3 이사 오기 (Constructors & this)
- **AP Topic:** 5.6 This Keyword
- **Mission:** 생성자를 통해 주민 객체를 올바르게 초기화합니다.
- **Scenario:** 이름이 같은 매개변수와 인스턴스 변수 구분하기.
  - `this.name = name;`

---

## 📂 Unit 4. 지형 데이터 복구: 배열과 알고리즘
> **Story:** 섬의 물리 엔진이 고장 났습니다. 꽃 교배 알고리즘이 자기 자신과 교배를 시도해 에러를 뿜어내고, 플레이어가 섬 끝 절벽 너머로 추락하는 버그가 발생했습니다. 격자(Grid) 시스템을 재구축해야 합니다.

### 4.1 주머니 정리 정돈 (Array vs ArrayList)
- **AP Topic:** 6.1 Arrays / 7.1 ArrayList
- **Mission:** 고정 크기 데이터(Map Tile)와 가변 크기 데이터(Pocket)의 차이를 이해합니다.
- **Challenge:** 주머니에서 아이템을 삭제할 때 인덱스가 밀리는 현상 해결 (역순 순회).

### 4.2 지도 그리드 스캔 (2D Array Traversal)
- **AP Topic:** 8.1 2D Arrays / 8.2 Traversing 2D Arrays
- **Mission:** 섬 전체(`Map[][]`)를 스캔하여 잡초의 위치를 파악합니다.
- **Key Pattern:** Row-Major Traversal (행 우선 순회).
  ```java
  for (int r = 0; r < map.length; r++) {
      for (int c = 0; c < map[0].length; c++) {
          if (map[r][c].isWeed()) { removeWeed(); }
      }
  }
  ```

### 4.3 꽃 교배 로직의 역설 (2D Algorithms)
- **AP Topic:** 8.2 (Simulations)
- **Context:** 2025년 AP 시험 최저 정답률 유형.
- **Mission:** "이웃한 꽃"을 찾되, **자기 자신을 포함하지 않는** 로직을 구현합니다.
- **Code Solution (Self-Pairing Guard):**
  ```java
  // 3x3 범위 탐색
  for (int r = row-1; r <= row+1; r++) {
      for (int c = col-1; c <= col+1; c++) {
          // 경계 체크 AND 자기 자신 제외
          if (isValid(r, c) && !(r == row && c == col)) {
              checkCrossBreeding(map[r][c]);
          }
      }
  }
  ```

### 4.4 세상의 끝 (Boundary Checking)
- **AP Topic:** 6.4 Arrays: Creation and Access
- **Mission:** `ArrayIndexOutOfBoundsException` 방지.
- **Metaphor:** "지도의 끝은 절벽이다. 절벽 너머에 울타리를 칠 수 없다."

---

## 🎓 평가 및 마무리

### 디지털 결정 규칙 (Digital Decision Rules) 트레이닝
- **코딩 표준:** 너굴 개발사는 들여쓰기(Indentation)를 중시합니다. (시험에서는 필수가 아니지만, 가독성을 위해 필수)
- **오타 정책:** `ArrayList`를 `Arraylist`로 쓰는 것은 허용되지만, `System.out.print`를 `print`로만 쓰는 것은 감점될 수 있습니다.

### 에필로그
모든 미션을 완료하면, 플레이어는 레거시 코드로 가득 했던 섬을 객체 지향의 낙원으로 재건하게 됩니다. 여러분은 더 이상 코드를 '암기'하는 학생이 아니라, 시스템을 '설계'하는 **수석 엔지니어(Chief Architect)**입니다.

---
*Based on 2025 College Board AP Computer Science A Scoring Statistics & Course Description.*
