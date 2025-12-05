import React, { useState, useEffect } from 'react';
import '../../styles/MissionManager.css';

interface MissionManagerProps {
  adminToken?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  language: 'python' | 'java' | 'javascript';
  points: number;
  order: number;
  solution?: {
    code: string;
    explanation: string;
    keyPoints: string[];
  };
}

const MissionManager: React.FC<MissionManagerProps> = ({ adminToken }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSolutionEditor, setShowSolutionEditor] = useState(false);
  const [solutionForm, setSolutionForm] = useState({
    code: '',
    explanation: '',
    keyPoints: [] as string[],
  });

  // Fetch missions on mount
  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/missions', {
        headers: {
          Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }

      const data = await response.json();
      setMissions(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
    if (mission.solution) {
      setSolutionForm({
        code: mission.solution.code,
        explanation: mission.solution.explanation,
        keyPoints: mission.solution.keyPoints || [],
      });
    }
  };

  const handleUpdateSolution = async () => {
    if (!selectedMission) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/missions/${selectedMission.id}/solution`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
          body: JSON.stringify(solutionForm),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update solution');
      }

      // Update local state
      setSelectedMission({
        ...selectedMission,
        solution: solutionForm,
      });

      setShowSolutionEditor(false);
      setError(null);
      alert('Solution updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update solution');
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!window.confirm('정말 이 Mission을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/missions/${missionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      // Refresh missions
      await fetchMissions();
      setSelectedMission(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mission');
    }
  };

  const getMissionDifficultyColor = (
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    switch (difficulty) {
      case 'beginner':
        return 'difficulty-beginner';
      case 'intermediate':
        return 'difficulty-intermediate';
      case 'advanced':
        return 'difficulty-advanced';
    }
  };

  return (
    <div className="mission-manager">
      <h2>🎯 Mission 관리</h2>

      <div className="manager-container">
        <div className="missions-panel">
          <h3>Missions ({missions.length})</h3>
          {isLoading && <p>로딩 중...</p>}
          {error && <div className="error-message">❌ {error}</div>}
          <div className="missions-list">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`mission-item ${selectedMission?.id === mission.id ? 'active' : ''}`}
                onClick={() => handleSelectMission(mission)}
              >
                <div className="mission-header">
                  <div className="mission-id">{mission.id}</div>
                  <div className={`mission-difficulty ${getMissionDifficultyColor(mission.difficulty)}`}>
                    {mission.difficulty}
                  </div>
                </div>
                <div className="mission-title">{mission.title}</div>
                <div className="mission-meta">
                  {mission.points}pts · {mission.language}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="details-panel">
          {selectedMission ? (
            <>
              <div className="details-header">
                <h3>{selectedMission.title}</h3>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteMission(selectedMission.id)}
                >
                  🗑️ Delete Mission
                </button>
              </div>

              <div className="mission-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <label>ID:</label>
                    <span>{selectedMission.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Title:</label>
                    <span>{selectedMission.title}</span>
                  </div>
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{selectedMission.description}</span>
                  </div>
                  <div className="detail-row">
                    <label>Category:</label>
                    <span>{selectedMission.category}</span>
                  </div>
                  <div className="detail-row">
                    <label>Difficulty:</label>
                    <span className={getMissionDifficultyColor(selectedMission.difficulty)}>
                      {selectedMission.difficulty}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Points:</label>
                    <span>{selectedMission.points}</span>
                  </div>
                  <div className="detail-row">
                    <label>Language:</label>
                    <span>{selectedMission.language}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <div className="solution-header">
                    <h4>Solution</h4>
                    <button
                      className="btn-edit"
                      onClick={() =>
                        setShowSolutionEditor(!showSolutionEditor)
                      }
                    >
                      {showSolutionEditor ? '❌ Cancel' : '✏️ Edit'}
                    </button>
                  </div>

                  {showSolutionEditor ? (
                    <SolutionEditor
                      solutionForm={solutionForm}
                      setSolutionForm={setSolutionForm}
                      onSave={handleUpdateSolution}
                      onCancel={() => setShowSolutionEditor(false)}
                    />
                  ) : (
                    <>
                      {selectedMission.solution ? (
                        <div className="solution-view">
                          <div className="solution-code">
                            <h5>Code:</h5>
                            <pre>{selectedMission.solution.code}</pre>
                          </div>
                          <div className="solution-explanation">
                            <h5>Explanation:</h5>
                            <p>{selectedMission.solution.explanation}</p>
                          </div>
                          {selectedMission.solution.keyPoints && (
                            <div className="solution-keypoints">
                              <h5>Key Points:</h5>
                              <ul>
                                {selectedMission.solution.keyPoints.map(
                                  (point, idx) => (
                                    <li key={idx}>{point}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="no-solution">Solution이 없습니다.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Mission을 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SolutionEditorProps {
  solutionForm: {
    code: string;
    explanation: string;
    keyPoints: string[];
  };
  setSolutionForm: (form: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({
  solutionForm,
  setSolutionForm,
  onSave,
  onCancel,
}) => {
  return (
    <div className="solution-editor">
      <div className="editor-group">
        <label>Code:</label>
        <textarea
          value={solutionForm.code}
          onChange={(e) =>
            setSolutionForm({ ...solutionForm, code: e.target.value })
          }
          rows={6}
        />
      </div>

      <div className="editor-group">
        <label>Explanation:</label>
        <textarea
          value={solutionForm.explanation}
          onChange={(e) =>
            setSolutionForm({ ...solutionForm, explanation: e.target.value })
          }
          rows={4}
        />
      </div>

      <div className="editor-group">
        <label>Key Points (comma separated):</label>
        <textarea
          value={solutionForm.keyPoints.join('\n')}
          onChange={(e) =>
            setSolutionForm({
              ...solutionForm,
              keyPoints: e.target.value
                .split('\n')
                .map((k) => k.trim())
                .filter((k) => k),
            })
          }
          rows={3}
          placeholder="Point 1&#10;Point 2&#10;Point 3"
        />
      </div>

      <div className="editor-actions">
        <button className="btn-submit" onClick={onSave}>
          Save Solution
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MissionManager;
