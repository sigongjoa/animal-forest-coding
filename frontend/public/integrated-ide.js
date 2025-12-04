/**
 * Integrated IDE with AssetManager and SceneComposer
 * Phase 3.1 Story Page Integration
 */

class IntegratedIDE {
  constructor() {
    this.assetManager = null;
    this.sceneComposer = null;
    this.feedbackCache = new Map();
    this.currentMission = null;
    this.missions = [];
    this.init();
  }

  /**
   * 초기화
   */
  async init() {
    console.log('🎮 Initializing Integrated IDE...');
    this.setupMissions();
    this.setupEventListeners();
    this.preloadAssets();
    console.log('✅ IDE Initialization Complete');
  }

  /**
   * 미션 설정
   */
  setupMissions() {
    this.missions = [
      {
        id: 'mission_1',
        title: '변수 선언하기',
        description: 'x라는 변수에 10을 할당하세요',
        language: 'python',
        testCode: 'print(x)',
        expectedOutput: '10',
        difficulty: 'beginner',
      },
      {
        id: 'mission_2',
        title: '함수 만들기',
        description: '두 수를 더하는 add 함수를 만들어보세요',
        language: 'python',
        testCode: 'print(add(5, 3))',
        expectedOutput: '8',
        difficulty: 'beginner',
      },
      {
        id: 'mission_3',
        title: '리스트 조작',
        description: '리스트의 첫 번째 요소를 출력하세요',
        language: 'python',
        testCode: 'arr = [1, 2, 3]\nprint(arr[0])',
        expectedOutput: '1',
        difficulty: 'intermediate',
      },
    ];

    console.log(`📚 ${this.missions.length}개의 미션 로드됨`);
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 미션 버튼
    const missionBtns = document.querySelectorAll('[data-mission-id]');
    missionBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const missionId = e.target.dataset.missionId;
        this.loadMission(missionId);
      });
    });

    // 제출 버튼
    const submitBtn = document.getElementById('submit-code');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitCode());
    }

    // 코드 에디터
    const codeEditor = document.getElementById('code-editor');
    if (codeEditor) {
      codeEditor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          this.submitCode();
        }
      });
    }
  }

  /**
   * 에셋 사전로드
   */
  async preloadAssets() {
    console.log('📦 Preloading assets...');
    // 실제 구현에서는 AssetManager 통합
    // this.assetManager.preloadAssets(['bg_beach', 'char_nook', 'ui_button'])
    console.log('✅ Assets preloaded');
  }

  /**
   * 미션 로드
   */
  loadMission(missionId) {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission) return;

    this.currentMission = mission;

    // UI 업데이트
    document.getElementById('mission-title').textContent = mission.title;
    document.getElementById('mission-description').textContent = mission.description;

    const editor = document.getElementById('code-editor');
    if (editor) {
      editor.value = `# ${mission.title}\n# ${mission.description}\n\n`;
    }

    // 난이도 표시
    const difficulty = document.getElementById('mission-difficulty');
    if (difficulty) {
      difficulty.textContent = mission.difficulty;
      difficulty.className = `difficulty ${mission.difficulty}`;
    }

    console.log(`📖 미션 로드: ${mission.title}`);
  }

  /**
   * 코드 제출
   */
  async submitCode() {
    if (!this.currentMission) {
      alert('먼저 미션을 선택하세요');
      return;
    }

    const codeEditor = document.getElementById('code-editor');
    const code = codeEditor?.value || '';

    console.log('📤 코드 제출:', this.currentMission.id);

    // 피드백 요청
    await this.requestFeedback(code);
  }

  /**
   * 피드백 요청
   */
  async requestFeedback(code) {
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cacheKey = `${this.currentMission.id}:${this._hashCode(code)}`;
      if (this.feedbackCache.has(cacheKey)) {
        const cachedFeedback = this.feedbackCache.get(cacheKey);
        console.log('💾 캐시에서 피드백 조회');
        this.displayFeedback(cachedFeedback, true);
        return;
      }

      // API 호출
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'student_' + Math.random().toString(36).substr(2, 9),
          missionId: this.currentMission.id,
          code: code,
          language: this.currentMission.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const feedback = data.data;

      // 캐시에 저장
      this.feedbackCache.set(cacheKey, feedback);

      // 응답 시간 기록
      const responseTime = Date.now() - startTime;
      console.log(
        `⏱️  응답 시간: ${responseTime}ms (캐시: ${feedback.fromCache ? '예' : '아니오'})`
      );

      this.displayFeedback(feedback, false);
    } catch (error) {
      console.error('❌ 피드백 요청 실패:', error);
      this.displayError(error.message);
    }
  }

  /**
   * 간단한 해시 함수
   */
  _hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 피드백 표시
   */
  displayFeedback(feedback, fromCache) {
    const feedbackElement = document.getElementById('feedback-output');
    if (!feedbackElement) return;

    let html = `
      <div class="feedback-container">
        <div class="feedback-header">
          <h3>🦝 너굴 선생님의 피드백</h3>
          ${fromCache ? '<span class="cache-badge">💾 캐시</span>' : ''}
        </div>

        <div class="encouragement">${feedback.encouragement}</div>

        ${
          feedback.errors.length > 0
            ? `
        <div class="errors">
          <h4>❌ 오류 (${feedback.errors.length}개)</h4>
          <ul>
            ${feedback.errors.map((e) => `<li><strong>${e.type}:</strong> ${e.description}</li>`).join('')}
          </ul>
        </div>
        `
            : '<div class="success">✅ 오류가 없습니다!</div>'
        }

        ${
          feedback.suggestions.length > 0
            ? `
        <div class="suggestions">
          <h4>💡 제안</h4>
          <ul>
            ${feedback.suggestions.map((s) => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        `
            : ''
        }

        ${
          feedback.learningPoints.length > 0
            ? `
        <div class="learning-points">
          <h4>📚 학습 포인트</h4>
          <ul>
            ${feedback.learningPoints.map((p) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        `
            : ''
        }

        ${
          feedback.nextSteps.length > 0
            ? `
        <div class="next-steps">
          <h4>🚀 다음 단계</h4>
          <ol>
            ${feedback.nextSteps.map((s) => `<li>${s}</li>`).join('')}
          </ol>
        </div>
        `
            : ''
        }

        <div class="fix-time">
          예상 수정 시간: <strong>${Math.round(feedback.estimatedFixTime / 60)}분</strong>
        </div>
      </div>
    `;

    feedbackElement.innerHTML = html;
    feedbackElement.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * 오류 표시
   */
  displayError(message) {
    const feedbackElement = document.getElementById('feedback-output');
    if (feedbackElement) {
      feedbackElement.innerHTML = `
        <div class="error-message">
          <h3>⚠️ 오류 발생</h3>
          <p>${message}</p>
          <p>다시 시도해주세요.</p>
        </div>
      `;
    }
  }

  /**
   * 캐시 통계
   */
  getCacheStats() {
    return {
      cachedItems: this.feedbackCache.size,
      totalSubmissions: this.feedbackCache.size, // 간단한 추정
    };
  }
}

// 페이지 로드 시 IDE 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.ide = new IntegratedIDE();
  console.log('🎮 IDE Ready!');
});
