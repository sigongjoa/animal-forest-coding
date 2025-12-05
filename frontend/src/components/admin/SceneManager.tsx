import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SortableSceneItem from './SortableSceneItem';
import '../../styles/SceneManager.css';

interface SceneManagerProps {
  adminToken?: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  order: number;
  sceneOrder: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Scene {
  id: string;
  type: 'story' | 'ide' | 'choice';
  imageUrl?: string;
  dialogues?: string[];
  missionId?: string;
  title?: string;
  description?: string;
  question?: string;
  options?: Array<{ text: string; nextSceneId: string }>;
  character: string;
  npcName: string;
}

const SceneManager: React.FC<SceneManagerProps> = ({ adminToken }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch episodes on mount
  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/episodes', {
        headers: {
          Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }

      const data = await response.json();
      setEpisodes(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch episodes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScenes = async (episodeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/episodes/${episodeId}/scenes`,
        {
          headers: {
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch scenes');
      }

      const data = await response.json();
      setScenes(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scenes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    fetchScenes(episode.id);
  };

  const handleCreateScene = async (sceneData: Partial<Scene>) => {
    if (!selectedEpisode) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/episodes/${selectedEpisode.id}/scenes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
          body: JSON.stringify(sceneData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create scene');
      }

      // Refresh scenes
      await fetchScenes(selectedEpisode.id);
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scene');
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!window.confirm('정말 이 Scene을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/scenes/${sceneId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete scene');
      }

      // Refresh scenes
      if (selectedEpisode) {
        await fetchScenes(selectedEpisode.id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scene');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!selectedEpisode) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(scenes, oldIndex, newIndex);
    setScenes(newOrder);

    // API 호출로 순서 저장
    try {
      const sceneOrder = newOrder.map((s) => s.id);
      const response = await fetch(
        `http://localhost:5000/api/admin/episodes/${selectedEpisode.id}/scenes/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken || 'admin@nook.com:base64'}`,
          },
          body: JSON.stringify({ sceneOrder }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reorder scenes');
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder scenes');
      // 실패 시 원래 순서로 복원
      await fetchScenes(selectedEpisode.id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="scene-manager">
      <h2>📺 Scene 관리</h2>

      <div className="manager-container">
        <div className="episodes-panel">
          <h3>Episodes</h3>
          {isLoading && <p>로딩 중...</p>}
          {error && <div className="error-message">❌ {error}</div>}
          <div className="episodes-list">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className={`episode-item ${selectedEpisode?.id === episode.id ? 'active' : ''}`}
                onClick={() => handleSelectEpisode(episode)}
              >
                <div className="episode-title">{episode.title}</div>
                <div className="episode-meta">
                  Difficulty: {episode.difficulty}
                  <br />
                  Scenes: {episode.sceneOrder.length}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="scenes-panel">
          {selectedEpisode ? (
            <>
              <div className="scenes-header">
                <h3>{selectedEpisode.title} - Scenes</h3>
                <button
                  className="btn-create"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  + Create Scene
                </button>
              </div>

              {showCreateForm && (
                <SceneForm
                  onSubmit={handleCreateScene}
                  onCancel={() => setShowCreateForm(false)}
                />
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={scenes.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="scenes-list">
                    {scenes.length === 0 ? (
                      <p>이 Episode에 Scene이 없습니다.</p>
                    ) : (
                      scenes.map((scene, index) => (
                        <SortableSceneItem
                          key={scene.id}
                          scene={scene}
                          index={index}
                          onDelete={handleDeleteScene}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          ) : (
            <div className="empty-state">
              <p>Episode을 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SceneFormProps {
  onSubmit: (sceneData: Partial<Scene>) => void;
  onCancel: () => void;
}

const SceneForm: React.FC<SceneFormProps> = ({ onSubmit, onCancel }) => {
  const [sceneType, setSceneType] = useState<'story' | 'ide' | 'choice'>('story');
  const [formData, setFormData] = useState<Partial<Scene>>({
    type: 'story',
    character: 'tom_nook',
    npcName: 'Tom Nook',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="scene-form" onSubmit={handleSubmit}>
      <h4>Create New Scene</h4>

      <div className="form-group">
        <label>Scene Type:</label>
        <select
          value={sceneType}
          onChange={(e) => {
            setSceneType(e.target.value as any);
            setFormData({ ...formData, type: e.target.value as any });
          }}
        >
          <option value="story">📖 Story</option>
          <option value="ide">💻 IDE Mission</option>
          <option value="choice">🎯 Choice</option>
        </select>
      </div>

      <div className="form-group">
        <label>NPC Name:</label>
        <input
          type="text"
          value={formData.npcName || ''}
          onChange={(e) => setFormData({ ...formData, npcName: e.target.value })}
          required
        />
      </div>

      {sceneType === 'story' && (
        <>
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/episode/1/opening.jpg"
            />
          </div>
          <div className="form-group">
            <label>Dialogues (comma separated):</label>
            <textarea
              value={formData.dialogues?.join('\n') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dialogues: e.target.value.split('\n').filter((d) => d.trim()),
                })
              }
              rows={4}
            />
          </div>
        </>
      )}

      {sceneType === 'ide' && (
        <>
          <div className="form-group">
            <label>Mission ID:</label>
            <input
              type="text"
              value={formData.missionId || ''}
              onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
              placeholder="mission-001"
              required
            />
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </>
      )}

      {sceneType === 'choice' && (
        <>
          <div className="form-group">
            <label>Question:</label>
            <textarea
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
              rows={2}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          Create Scene
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SceneManager;
