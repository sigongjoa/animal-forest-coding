import React, { useEffect, useRef, useState } from 'react';
import '../styles/IDEPage.css';

interface Mission {
  id: string;
  name: string;
  description: string;
  startCode: string;
  testCases: Array<{ input: string; expected: string }>;
  points: number;
}

const missions: Mission[] = [
  {
    id: 'var-101',
    name: '변수 선언',
    description: '변수를 선언하고 출력하세요',
    startCode: '# 변수를 만들고 출력해봅시다\nx = 10\nprint(x)',
    testCases: [{ input: '', expected: '10' }],
    points: 500,
  },
  {
    id: 'type-102',
    name: '데이터 타입',
    description: '다양한 데이터 타입을 다루세요',
    startCode: 'name = "너굴"\nage = 30\nheight = 165.5\nprint(name, age, height)',
    testCases: [{ input: '', expected: '너굴 30 165.5' }],
    points: 500,
  },
  {
    id: 'math-103',
    name: '산술 연산',
    description: '계산 문제를 풀어보세요',
    startCode: 'a = 10\nb = 3\nprint(a + b)\nprint(a * b)',
    testCases: [{ input: '', expected: '13\n30' }],
    points: 600,
  },
  {
    id: 'if-104',
    name: 'If 조건문',
    description: '조건문으로 분기를 만들어보세요',
    startCode: 'score = 85\nif score >= 80:\n    print("합격")\nelse:\n    print("불합격")',
    testCases: [{ input: '', expected: '합격' }],
    points: 700,
  },
  {
    id: 'loop-105',
    name: 'For 반복문',
    description: '반복문으로 여러 번 실행해보세요',
    startCode: 'for i in range(5):\n    print(i)',
    testCases: [{ input: '', expected: '0\n1\n2\n3\n4' }],
    points: 700,
  },
  {
    id: 'list-106',
    name: '리스트 조작',
    description: '리스트를 다루어보세요',
    startCode: 'fruits = ["사과", "바나나", "딸기"]\nprint(fruits[0])\nfruits.append("포도")\nprint(len(fruits))',
    testCases: [{ input: '', expected: '사과\n4' }],
    points: 700,
  },
];

const IDEPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'missions' | 'editor' | 'progress'>('missions');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0].id);
  const [code, setCode] = useState<string>(missions[0].startCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [nookMessage, setNookMessage] = useState<string>('안녕! 너는 코딩을 배울 준비가 되었나? 🦝');
  const pyRef = useRef<any>(null);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);

  // Initialize Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        // Load Pyodide script first
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
        script.onload = async () => {
          // @ts-ignore
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });
          pyRef.current = pyodide;
          setPyodideReady(true);
          setNookMessage('파이썬이 준비되었어! 🎉');
        };
        script.onerror = () => {
          setError('Pyodide 스크립트 로딩 실패');
          setNookMessage('파이썬 로딩에 실패했어... 😢');
        };
        document.head.appendChild(script);
      } catch (err) {
        setError('Pyodide 초기화 실패: ' + (err as Error).message);
        setNookMessage('파이썬 로딩에 실패했어... 😢');
      }
    };

    initPyodide();
  }, []);

  const currentMission = missions.find((m) => m.id === selectedMissionId);

  const handleMissionSelect = (missionId: string) => {
    setSelectedMissionId(missionId);
    const mission = missions.find((m) => m.id === missionId);
    if (mission) {
      setCode(mission.startCode);
      setOutput('');
      setError('');
    }
  };

  const runCode = async () => {
    if (!pyodideReady || !pyRef.current) {
      setError('Pyodide가 준비되지 않았습니다.');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      // Simply execute the user's code directly
      // Pyodide captures stdout automatically
      await pyRef.current.runPythonAsync(code);

      // Try to get output from Python's sys module
      const pythonCode = `
import sys
# Get captured output from stdout
sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
`;

      const capturedOutput = await pyRef.current.runPythonAsync(pythonCode);
      const finalOutput = capturedOutput && capturedOutput.trim() ? String(capturedOutput).trim() : '(코드가 실행되었습니다)';
      setOutput(finalOutput);

      // Check if passed test cases
      if (currentMission && finalOutput && finalOutput !== '(코드가 실행되었습니다)' && finalOutput === currentMission.testCases[0].expected.trim()) {
        if (!completedMissions.has(currentMission.id)) {
          const newCompleted = new Set(completedMissions);
          newCompleted.add(currentMission.id);
          setCompletedMissions(newCompleted);
          setTotalPoints(totalPoints + currentMission.points);
          setNookMessage(`좋아! "${currentMission.name}"를 완료했어! +${currentMission.points}점 🎉`);
        }
      } else if (currentMission) {
        setNookMessage('아직 아니야. 다시 한 번 시도해봐! 💪');
      }
    } catch (err) {
      setError((err as Error).message);
      setNookMessage('코드에 오류가 있어요. 다시 확인해봐! 🦝');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (currentMission) {
      setCode(currentMission.startCode);
      setOutput('');
      setError('');
    }
  };

  return (
    <div className="ide-container">
      {/* NookPhone Smartphone UI */}
      <div className="nookphone-wrapper">
        <div className="nookphone-container">
          {/* Header */}
          <div className="ide-header">
            <h2>너굴포트 IDE v2.0</h2>
            <div className="header-buttons">
              <button className="header-btn">−</button>
              <button className="header-btn">□</button>
              <button className="header-btn">✕</button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="ide-tabs">
            <button
              className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
              onClick={() => setActiveTab('missions')}
            >
              미션
            </button>
            <button
              className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              에디터
            </button>
            <button
              className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              진행도
            </button>
          </div>

          {/* Content Area */}
          <div className="ide-content">
            {/* Missions Tab */}
            {activeTab === 'missions' && (
              <div className="missions-panel">
                <h3>미션 목록</h3>
                <div className="missions-list">
                  {missions.map((mission) => (
                    <div
                      key={mission.id}
                      className={`mission-item ${selectedMissionId === mission.id ? 'selected' : ''} ${
                        completedMissions.has(mission.id) ? 'completed' : ''
                      }`}
                      onClick={() => handleMissionSelect(mission.id)}
                    >
                      <div className="mission-header">
                        <h4>{mission.name}</h4>
                        {completedMissions.has(mission.id) && <span className="badge">✓</span>}
                      </div>
                      <p className="mission-desc">{mission.description}</p>
                      <span className="mission-points">{mission.points}점</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="editor-panel">
                <h3>{currentMission?.name || '미션 선택'}</h3>
                <p className="mission-desc">{currentMission?.description}</p>

                <div className="editor-section">
                  <label>코드 입력:</label>
                  <textarea
                    className="code-editor"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="파이썬 코드를 입력하세요..."
                  />
                </div>

                <div className="editor-controls">
                  <button className="btn-primary" onClick={runCode} disabled={isRunning || !pyodideReady}>
                    {isRunning ? '실행 중...' : '실행'}
                  </button>
                  <button className="btn-secondary" onClick={handleResetCode}>
                    초기화
                  </button>
                </div>

                {output && (
                  <div className="output-section">
                    <label>출력 결과:</label>
                    <div className="output-box">{output}</div>
                  </div>
                )}

                {error && (
                  <div className="error-section">
                    <label>오류:</label>
                    <div className="error-box">{error}</div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="progress-panel">
                <h3>진행도</h3>
                <div className="stats">
                  <div className="stat-item">
                    <label>총 포인트:</label>
                    <span className="stat-value">{totalPoints}</span>
                  </div>
                  <div className="stat-item">
                    <label>완료 미션:</label>
                    <span className="stat-value">
                      {completedMissions.size} / {missions.length}
                    </span>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${(completedMissions.size / missions.length) * 100}%`,
                    }}
                  />
                </div>

                <h4>완료한 미션:</h4>
                <ul className="completed-missions">
                  {missions.map((mission) =>
                    completedMissions.has(mission.id) ? (
                      <li key={mission.id}>
                        <span className="check-mark">✓</span> {mission.name} (+{mission.points}점)
                      </li>
                    ) : null
                  )}
                </ul>

                {completedMissions.size === 0 && <p className="no-completed">아직 완료한 미션이 없어요.</p>}
              </div>
            )}
          </div>

          {/* Nook Character */}
          <div className="nook-section">
            <div className="nook-character">
              <div className="nook-head">
                <div className="nook-eye"></div>
                <div className="nook-eye"></div>
                <div className="nook-nose"></div>
              </div>
              <div className="nook-body"></div>
            </div>
            <div className="nook-message">{nookMessage}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDEPage;
