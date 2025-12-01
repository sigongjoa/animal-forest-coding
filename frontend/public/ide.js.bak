// ======================================
// 🚀 Interactive IDE System (Phase 2)
// Pyodide 기반 Python 실행 엔진
// ======================================

class IDEManager {
  constructor() {
    this.pyodide = null;
    this.isReady = false;
    this.isLoading = true;
    this.missions = [];
    this.currentMission = null;
    this.executionTimeout = 5000;
  }

  async initPyodide() {
    console.log('🔄 Pyodide 초기화 중...');
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      this.pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/'
      });

      this.isReady = true;
      this.isLoading = false;
      console.log('✅ Pyodide 준비 완료');
      return true;
    } catch (error) {
      console.error('❌ Pyodide 초기화 실패:', error);
      this.isLoading = false;
      return false;
    }
  }

  async loadMissions() {
    try {
      this.missions = [
        {
          id: 'mission_001',
          title: '변수 이해하기',
          difficulty: 'beginner',
          description: '당신의 이름을 저장하는 변수를 만들고 출력하세요',
          startCode: '# 당신의 이름을 저장하세요\nname = \n\n# 이름을 출력하세요\nprint(name)',
          testCases: [
            {
              type: 'output_contains',
              pattern: '.',
              message: '무언가 출력되어야 합니다'
            }
          ],
          hints: [
            '변수를 만들려면: 변수명 = 값',
            '문자열은 따옴표로 감싸야 합니다: "..."'
          ],
          feedback: {
            success: '오호! 완벽하구리! 변수가 뭔지 이제 알겠지?',
            error: '음... 뭔가 이상한데? 다시 한 번 살펴보게!'
          },
          reward: {
            points: 500,
            badge: '변수_마스터'
          }
        },
        {
          id: 'mission_002',
          title: '데이터 타입',
          difficulty: 'beginner',
          description: '정수, 실수, 문자열의 차이를 이해하세요',
          startCode: '# 정수\nage = \n\n# 실수\nheight = \n\n# 문자열\nname = \n\nprint(type(age), type(height), type(name))',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'int',
              message: '정수형(int)을 사용해야 합니다'
            }
          ],
          hints: [
            '정수: 123',
            '실수: 1.23',
            '문자열: "text"'
          ],
          feedback: {
            success: '훌륭합니다! 데이터 타입을 잘 이해했네요!',
            error: '데이터 타입을 다시 확인해보세요'
          },
          reward: {
            points: 500,
            badge: '데이터타입_전문가'
          }
        },
        {
          id: 'mission_003',
          title: '더하기와 곱하기',
          difficulty: 'beginner',
          description: '두 수를 더하고 곱하는 연산을 해보세요',
          startCode: 'a = 5\nb = 3\n\n# 더하기\nsum_result = \n\n# 곱하기\nmul_result = \n\nprint(sum_result, mul_result)',
          testCases: [
            {
              type: 'code_contains',
              pattern: '\\+',
              message: '더하기 연산(+)을 사용해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: '\\*',
              message: '곱하기 연산(*)을 사용해야 합니다'
            }
          ],
          hints: [
            'a + b로 두 수를 더합니다',
            'a * b로 두 수를 곱합니다'
          ],
          feedback: {
            success: '완벽합니다! 산술 연산을 마스터했네요!',
            error: '연산자를 다시 확인해보세요'
          },
          reward: {
            points: 600,
            badge: '계산_능력자'
          }
        },
        {
          id: 'mission_004',
          title: 'if 조건문',
          difficulty: 'beginner',
          description: '나이가 18세 이상이면 "성인"을, 아니면 "미성년자"를 출력하세요',
          startCode: 'age = 20\n\nif age >= 18:\n    print("성인")\nelse:\n    print("미성년자")',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'if',
              message: 'if 문을 사용해야 합니다'
            }
          ],
          hints: [
            'if age >= 18: 를 사용하세요',
            'else: 를 사용하여 다른 경우를 처리합니다'
          ],
          feedback: {
            success: '조건문을 완벽하게 이해했습니다!',
            error: '조건문 문법을 다시 확인하세요'
          },
          reward: {
            points: 700,
            badge: '조건문_전문가'
          }
        },
        {
          id: 'mission_005',
          title: '반복문 for',
          difficulty: 'beginner',
          description: '1부터 5까지 출력하는 for 루프를 작성하세요',
          startCode: 'for i in range(1, 6):\n    print(i)',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'for',
              message: 'for 반복문을 사용해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: 'range',
              message: 'range() 함수를 사용해야 합니다'
            }
          ],
          hints: [
            'for i in range(1, 6): 를 사용합니다',
            'range(1, 6)은 1부터 5까지의 숫자를 생성합니다'
          ],
          feedback: {
            success: '반복문을 완벽하게 수행했습니다!',
            error: 'for 루프와 range() 함수를 확인하세요'
          },
          reward: {
            points: 700,
            badge: '반복문_마스터'
          }
        },
        {
          id: 'mission_006',
          title: '리스트 생성과 접근',
          difficulty: 'beginner',
          description: '동물 친구들의 이름을 리스트에 저장하고 첫 번째 이름을 출력하세요',
          startCode: '# 리스트 생성\nanimals = ["너굴", "윤호", "돌리"]\n\n# 첫 번째 원소 접근\nprint(animals[0])',
          testCases: [
            {
              type: 'code_contains',
              pattern: '\\[',
              message: '리스트를 생성해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: '\\[0\\]',
              message: '인덱스로 원소에 접근해야 합니다'
            }
          ],
          hints: [
            '리스트는 대괄호 []로 만듭니다',
            '첫 번째 원소는 [0]으로 접근합니다'
          ],
          feedback: {
            success: '리스트 연산을 잘 이해했습니다!',
            error: '리스트 문법을 다시 확인하세요'
          },
          reward: {
            points: 700,
            badge: '리스트_전문가'
          }
        },
        {
          id: 'mission_007',
          title: '함수 정의',
          difficulty: 'intermediate',
          description: '인사하는 함수를 만들고 호출하세요',
          startCode: 'def greet(name):\n    print(f"안녕하세요, {name}님!")\n\ngreet("너굴")',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'def',
              message: 'def 키워드로 함수를 정의해야 합니다'
            }
          ],
          hints: [
            'def 함수명(매개변수): 로 함수를 정의합니다',
            '함수는 들여쓰기로 본문을 구분합니다'
          ],
          feedback: {
            success: '함수 정의를 완벽하게 이해했습니다!',
            error: '함수 문법을 다시 확인하세요'
          },
          reward: {
            points: 800,
            badge: '함수_제작자'
          }
        },
        {
          id: 'mission_008',
          title: '딕셔너리 사용',
          difficulty: 'intermediate',
          description: '너굴의 정보를 딕셔너리에 저장하고 이름을 출력하세요',
          startCode: 'nook = {"이름": "너굴", "직업": "가게 주인", "특징": "돈을 좋아함"}\n\nprint(nook["이름"])',
          testCases: [
            {
              type: 'code_contains',
              pattern: '\\{',
              message: '딕셔너리를 생성해야 합니다'
            }
          ],
          hints: [
            '딕셔너리는 중괄호 {}로 만듭니다',
            '{"키": "값"} 형식으로 저장합니다'
          ],
          feedback: {
            success: '딕셔너리를 잘 사용했습니다!',
            error: '딕셔너리 문법을 다시 확인하세요'
          },
          reward: {
            points: 800,
            badge: '딕셔너리_마스터'
          }
        },
        {
          id: 'mission_009',
          title: '문자열 메서드',
          difficulty: 'intermediate',
          description: '문자열을 대문자로 변환하고, 글자 개수를 세어보세요',
          startCode: 'message = "Welcome to Animal Crossing"\n\n# 대문자로 변환\nupper = \n\n# 글자 개수\nlength = \n\nprint(upper)\nprint(length)',
          testCases: [
            {
              type: 'code_contains',
              pattern: '\\.upper\\(\\)',
              message: '.upper() 메서드를 사용해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: 'len\\(',
              message: 'len() 함수를 사용해야 합니다'
            }
          ],
          hints: [
            '문자열.upper()는 대문자로 변환합니다',
            'len(문자열)은 글자 개수를 반환합니다'
          ],
          feedback: {
            success: '문자열 메서드를 완벽하게 사용했습니다!',
            error: '메서드 문법을 다시 확인하세요'
          },
          reward: {
            points: 800,
            badge: '문자열_전문가'
          }
        },
        {
          id: 'mission_010',
          title: '리스트 반복',
          difficulty: 'intermediate',
          description: '과일 리스트의 모든 원소를 출력하세요',
          startCode: 'fruits = ["사과", "바나나", "딸기", "포도"]\n\n# 모든 과일 출력\nfor fruit in fruits:\n    print(fruit)',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'for',
              message: 'for 반복문을 사용해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: 'in',
              message: 'in 키워드로 리스트를 순회해야 합니다'
            }
          ],
          hints: [
            'for 변수 in 리스트: 형태로 순회합니다',
            '각 반복에서 변수는 리스트의 원소를 가집니다'
          ],
          feedback: {
            success: '리스트 순회를 완벽하게 수행했습니다!',
            error: 'for...in 문법을 다시 확인하세요'
          },
          reward: {
            points: 800,
            badge: '순회_전문가'
          }
        },
        {
          id: 'mission_011',
          title: '예외 처리',
          difficulty: 'advanced',
          description: '숫자로 나누기를 시도하고, 0으로 나누기 오류를 처리하세요',
          startCode: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("0으로 나눌 수 없습니다!")',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'try',
              message: 'try 블록을 사용해야 합니다'
            },
            {
              type: 'code_contains',
              pattern: 'except',
              message: 'except 블록으로 예외를 처리해야 합니다'
            }
          ],
          hints: [
            'try: 블록에 위험한 코드를 넣습니다',
            'except 예외종류: 로 오류를 처리합니다'
          ],
          feedback: {
            success: '예외 처리를 완벽하게 구현했습니다!',
            error: '예외 처리 문법을 다시 확인하세요'
          },
          reward: {
            points: 1000,
            badge: '안전_프로그래머'
          }
        },
        {
          id: 'mission_012',
          title: 'import와 모듈',
          difficulty: 'advanced',
          description: '현재 시간을 출력하기 위해 datetime 모듈을 사용하세요',
          startCode: 'import datetime\n\n# 현재 시간 가져오기\nnow = datetime.datetime.now()\nprint(f"현재 시간: {now.hour}시 {now.minute}분")',
          testCases: [
            {
              type: 'code_contains',
              pattern: 'import',
              message: 'import로 모듈을 불러와야 합니다'
            }
          ],
          hints: [
            'import 모듈명 으로 모듈을 불러옵니다',
            'datetime.datetime.now()는 현재 시간을 반환합니다'
          ],
          feedback: {
            success: '모듈 사용을 완벽하게 이해했습니다!',
            error: 'import 문법을 다시 확인하세요'
          },
          reward: {
            points: 1000,
            badge: '모듈_마스터'
          }
        }
      ];
      console.log(`✅ ${this.missions.length}개 미션 로드 완료`);
      return this.missions;
    } catch (error) {
      console.error('❌ 미션 로드 실패:', error);
      return [];
    }
  }

  async executeCode(code) {
    if (!this.isReady) {
      return {
        success: false,
        error: 'Pyodide가 준비되지 않았습니다.',
        output: ''
      };
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('실행 시간 초과 (5초)')), this.executionTimeout)
      );

      const executionPromise = (async () => {
        try {
          const result = await this.pyodide.runPythonAsync(code);
          return {
            success: true,
            output: result || '실행 완료',
            error: ''
          };
        } catch (error) {
          return {
            success: false,
            output: '',
            error: error.toString()
          };
        }
      })();

      return await Promise.race([executionPromise, timeoutPromise]);
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message || '알 수 없는 에러'
      };
    }
  }

  async gradeMission(code, missionId) {
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) {
      return { passed: false, message: '미션을 찾을 수 없습니다' };
    }

    const result = await this.executeCode(code);

    if (!result.success) {
      return {
        passed: false,
        message: mission.feedback.error,
        hint: mission.hints[0],
        error: result.error
      };
    }

    for (const testCase of mission.testCases) {
      if (testCase.type === 'output_contains') {
        const regex = new RegExp(testCase.pattern);
        if (!regex.test(result.output)) {
          return {
            passed: false,
            message: mission.feedback.error,
            hint: testCase.message,
            error: `기대 결과: ${testCase.pattern}`
          };
        }
      } else if (testCase.type === 'code_contains') {
        const regex = new RegExp(testCase.pattern);
        if (!regex.test(code)) {
          return {
            passed: false,
            message: mission.feedback.error,
            hint: testCase.message,
            error: `코드에 ${testCase.pattern}가 포함되어야 합니다`
          };
        }
      }
    }

    return {
      passed: true,
      message: mission.feedback.success,
      reward: mission.reward,
      output: result.output
    };
  }

  selectMission(missionId) {
    this.currentMission = this.missions.find(m => m.id === missionId);
    return this.currentMission;
  }
}

const ide = new IDEManager();

async function initializeIDE() {
  const success = await ide.initPyodide();
  if (success) {
    await ide.loadMissions();
  }
  return success;
}
