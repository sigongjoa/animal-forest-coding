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
