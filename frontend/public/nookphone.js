// 너굴포트(NookPhone) UI System

class NookPhoneUI {
  constructor() {
    this.isOpen = false;
    this.currentTab = 'missions';
  }

  createNookPhoneHTML() {
    return `
      <div id="nookphone-container" class="nookphone-container">
        <div id="nookphone" class="nookphone">
          <div class="nookphone-header">
            <div class="nookphone-status">
              <span class="battery">🔋</span>
              <span class="signal">📶</span>
            </div>
            <div class="nookphone-title">너굴포트 v2.0</div>
            <div class="nookphone-time" id="nookphone-time">00:00</div>
          </div>

          <div class="nookphone-tabs">
            <button class="tab-btn active" onclick="nookphone.switchTab('missions')">📖 미션</button>
            <button class="tab-btn" onclick="nookphone.switchTab('editor')">💻 에디터</button>
            <button class="tab-btn" onclick="nookphone.switchTab('progress')">📊 진행도</button>
          </div>

          <div class="nookphone-content">
            <div id="tab-missions" class="tab-content active">
              <div class="missions-list" id="missions-list"></div>
            </div>

            <div id="tab-editor" class="tab-content">
              <div class="editor-section">
                <div class="editor-header">
                  <span id="mission-title">미션을 선택하세요</span>
                  <button class="hint-btn" onclick="nookphone.showHint()">💡</button>
                </div>
                <textarea
                  id="code-editor"
                  class="code-editor"
                  placeholder="Python 코드를 입력하세요..."
                  spellcheck="false"
                ></textarea>
                <div class="editor-footer">
                  <button class="run-btn" onclick="nookphone.runCode()">🍃 실행</button>
                  <button class="reset-btn" onclick="nookphone.resetCode()">🔄</button>
                </div>
              </div>
              <div class="console-section">
                <div class="console-header">결과</div>
                <div id="code-output" class="code-output"></div>
              </div>
            </div>

            <div id="tab-progress" class="tab-content">
              <div class="progress-section">
                <div class="progress-header">🎯 진행도</div>
                <div id="progress-list" class="progress-list"></div>
              </div>
            </div>
          </div>
        </div>

        <div id="nook-reaction" class="nook-reaction hidden">
          <div class="reaction-avatar">🦝</div>
          <div class="reaction-message" id="reaction-message"></div>
        </div>
      </div>
    `;
  }

  createNookPhoneStyles() {
    return `
      <style>
        .nookphone-container {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .nookphone {
          width: 360px;
          height: 600px;
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
          border: 8px solid #8d6e63;
          border-radius: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: phoneEntry 0.5s ease-out;
        }

        @keyframes phoneEntry {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .nookphone-header {
          background: #a5d6a7;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .nookphone-title {
          font-size: 14px;
          font-weight: bold;
          color: #2e7d32;
        }

        .nookphone-tabs {
          display: flex;
          gap: 2px;
          background: #f1f8e9;
          padding: 8px;
          border-bottom: 2px solid #81c784;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: rgba(255,255,255,0.6);
          color: #2e7d32;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .tab-btn.active {
          background: white;
          color: #1b5e20;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .nookphone-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .tab-content {
          display: none;
          padding: 16px;
          height: 100%;
          overflow-y: auto;
        }

        .tab-content.active {
          display: flex;
          flex-direction: column;
        }

        .missions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mission-card {
          background: white;
          border: 2px solid #c8e6c9;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .mission-card:hover {
          border-color: #81c784;
          box-shadow: 0 4px 12px rgba(129,199,132,0.2);
          transform: translateY(-2px);
        }

        .mission-card.active {
          background: #e8f5e9;
          border-color: #2e7d32;
        }

        .mission-difficulty {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 8px;
        }

        .mission-difficulty.beginner {
          background: #c8e6c9;
          color: #1b5e20;
        }

        .editor-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 600;
          color: #2e7d32;
        }

        .hint-btn {
          background: #fff3e0;
          border: none;
          color: #e65100;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }

        .code-editor {
          flex: 1;
          background: #263238;
          color: #aed581;
          border: 2px solid #4db6ac;
          border-radius: 8px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.6;
          resize: none;
          outline: none;
        }

        .code-editor:focus {
          border-color: #81c784;
          box-shadow: 0 0 8px rgba(129,199,132,0.3);
        }

        .editor-footer {
          display: flex;
          gap: 8px;
        }

        .run-btn {
          flex: 2;
          background: #81c784;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        }

        .run-btn:hover {
          background: #66bb6a;
        }

        .reset-btn {
          flex: 1;
          background: #ffccbc;
          color: #bf360c;
          border: none;
          padding: 10px 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
        }

        .console-section {
          background: white;
          border: 2px solid #c8e6c9;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 150px;
        }

        .console-header {
          background: #a5d6a7;
          color: #1b5e20;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .code-output {
          flex: 1;
          background: #263238;
          color: #aed581;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.5;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .code-output.error {
          color: #ff6b6b;
        }

        .code-output.success {
          color: #4ade80;
        }

        .nook-reaction {
          position: fixed;
          bottom: 640px;
          right: 80px;
          background: white;
          border: 3px solid #8d6e63;
          border-radius: 16px;
          padding: 12px 16px;
          max-width: 200px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          display: flex;
          gap: 8px;
          align-items: flex-start;
          animation: reactionEntry 0.4s ease-out;
        }

        .nook-reaction.hidden {
          display: none;
        }

        @keyframes reactionEntry {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .reaction-avatar {
          font-size: 32px;
          flex-shrink: 0;
        }

        .reaction-message {
          font-size: 12px;
          color: #2e7d32;
          line-height: 1.4;
          padding-top: 4px;
        }

        .nookphone-content::-webkit-scrollbar {
          width: 6px;
        }

        .nookphone-content::-webkit-scrollbar-track {
          background: #f1f8e9;
        }

        .nookphone-content::-webkit-scrollbar-thumb {
          background: #81c784;
          border-radius: 3px;
        }
      </style>
    `;
  }

  init() {
    const html = this.createNookPhoneHTML();
    document.body.insertAdjacentHTML('beforeend', html);

    const style = this.createNookPhoneStyles();
    document.head.insertAdjacentHTML('beforeend', style);

    this.attachEventListeners();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);

    console.log('✅ 너굴포트 초기화 완료');
  }

  attachEventListeners() {
    document.getElementById('code-editor')?.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.runCode();
      }
    });
    this.displayMissions();
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) tabElement.classList.add('active');

    const activeButton = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
      btn.textContent.includes(['미션', '에디터', '진행도'][['missions', 'editor', 'progress'].indexOf(tabName)])
    );
    if (activeButton) activeButton.classList.add('active');

    this.currentTab = tabName;
  }

  displayMissions() {
    const missionsList = document.getElementById('missions-list');
    if (!missionsList || ide.missions.length === 0) return;

    missionsList.innerHTML = ide.missions.map(mission => `
      <div class="mission-card ${mission.id === ide.currentMission?.id ? 'active' : ''}"
           onclick="nookphone.selectMission('${mission.id}')">
        <div style="font-weight: 600; color: #2e7d32;">${mission.title}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">${mission.description}</div>
        <span class="mission-difficulty ${mission.difficulty}">${mission.difficulty}</span>
      </div>
    `).join('');
  }

  selectMission(missionId) {
    const mission = ide.selectMission(missionId);
    if (!mission) return;

    document.querySelectorAll('.mission-card').forEach(card => {
      card.classList.remove('active');
    });
    event.currentTarget?.classList.add('active');

    document.getElementById('code-editor').value = mission.startCode;
    document.getElementById('mission-title').textContent = mission.title;
    document.getElementById('code-output').textContent = '';
    document.getElementById('code-output').className = 'code-output';

    this.switchTab('editor');
  }

  async runCode() {
    const code = document.getElementById('code-editor').value;
    const output = document.getElementById('code-output');

    if (!code.trim()) {
      output.textContent = '코드를 입력하세요';
      output.className = 'code-output error';
      return;
    }

    output.textContent = '실행 중... ⏳';
    output.className = 'code-output loading';

    const result = await ide.executeCode(code);

    if (result.success) {
      output.textContent = result.output || '실행 완료 ✓';
      output.className = 'code-output success';

      if (ide.currentMission) {
        const gradeResult = await ide.gradeMission(code, ide.currentMission.id);
        this.showNookReaction(gradeResult);
      }
    } else {
      output.textContent = `❌ 에러:\n${result.error}`;
      output.className = 'code-output error';
      this.showNookReaction({
        message: '음... 뭔가 이상한데?',
        error: result.error
      });
    }
  }

  resetCode() {
    if (ide.currentMission) {
      document.getElementById('code-editor').value = ide.currentMission.startCode;
    } else {
      document.getElementById('code-editor').value = '';
    }
    document.getElementById('code-output').textContent = '';
    document.getElementById('code-output').className = 'code-output';
  }

  showHint() {
    if (!ide.currentMission || ide.currentMission.hints.length === 0) {
      alert('힌트가 없습니다');
      return;
    }
    alert('💡 힌트:\n' + ide.currentMission.hints.join('\n'));
  }

  showNookReaction(result) {
    const reactionEl = document.getElementById('nook-reaction');
    const messageEl = document.getElementById('reaction-message');

    let message = result.message || result.feedback || '...';
    if (result.error && !result.passed) {
      message = result.hint || message;
    }

    messageEl.textContent = message;
    reactionEl.classList.remove('hidden');

    setTimeout(() => {
      reactionEl.classList.add('hidden');
    }, 3000);
  }

  updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const timeEl = document.getElementById('nookphone-time');
    if (timeEl) timeEl.textContent = time;
  }
}

const nookphone = new NookPhoneUI();
