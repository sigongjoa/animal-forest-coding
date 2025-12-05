import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableSceneItemProps {
  scene: Scene;
  index: number;
  onDelete: (sceneId: string) => void;
}

const SortableSceneItem: React.FC<SortableSceneItemProps> = ({ scene, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSceneTypeLabel = (type: string) => {
    switch (type) {
      case 'story':
        return '📖 Story';
      case 'ide':
        return '💻 IDE Mission';
      case 'choice':
        return '🎯 Choice';
      default:
        return type;
    }
  };

  const getSceneDetails = () => {
    switch (scene.type) {
      case 'story':
        return `Image: ${scene.imageUrl || 'N/A'} | Dialogues: ${scene.dialogues?.length || 0}`;
      case 'ide':
        return `Mission: ${scene.missionId || 'N/A'} | Title: ${scene.title || 'N/A'}`;
      case 'choice':
        return `Question: ${scene.question?.substring(0, 50) || 'N/A'}...`;
      default:
        return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="scene-item"
    >
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Drag to reorder"
      >
        ☰
      </div>
      <div className="scene-number">{index + 1}</div>
      <div className="scene-info">
        <div className="scene-type">{getSceneTypeLabel(scene.type)}</div>
        <div className="scene-meta">
          NPC: {scene.npcName}
          <br />
          {getSceneDetails()}
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDelete(scene.id)}
      >
        Delete
      </button>
    </div>
  );
};

export default SortableSceneItem;
