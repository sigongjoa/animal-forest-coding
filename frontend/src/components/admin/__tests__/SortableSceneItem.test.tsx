import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SortableSceneItem from '../SortableSceneItem';

// Mock dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('SortableSceneItem Component', () => {
  const mockScene = {
    id: 'scene-1',
    type: 'story' as const,
    character: 'tom_nook',
    npcName: 'Tom Nook',
    imageUrl: '/img.jpg',
    dialogues: ['Hello', 'How are you?'],
  };

  const mockOnDelete = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('UC-1.1: renders scene item with all required elements', () => {
      render(
        <SortableSceneItem scene={mockScene} index={0} onDelete={mockOnDelete} />
      );

      expect(screen.getByText('Tom Nook')).toBeInTheDocument();
      expect(screen.getByText('📖 Story')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    test('UC-1.2: renders drag handle for mouse interaction', () => {
      const { container } = render(
        <SortableSceneItem scene={mockScene} index={0} onDelete={mockOnDelete} />
      );

      const dragHandle = container.querySelector('.drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle?.textContent).toContain('☰');
    });

    test('UC-1.4: displays correct icon for different scene types', () => {
      const types = [
        { type: 'story' as const, label: '📖 Story' },
        { type: 'ide' as const, label: '💻 IDE Mission' },
        { type: 'choice' as const, label: '🎯 Choice' },
      ];

      types.forEach(({ type, label }) => {
        const { unmount } = render(
          <SortableSceneItem
            scene={{ ...mockScene, type }}
            index={0}
            onDelete={mockOnDelete}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    test('UC-1.5: displays correct details for story scene', () => {
      const storyScene = {
        ...mockScene,
        type: 'story' as const,
        imageUrl: '/path/to/image.jpg',
        dialogues: ['Line 1', 'Line 2'],
      };

      render(
        <SortableSceneItem
          scene={storyScene}
          index={0}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/\/path\/to\/image\.jpg/)).toBeInTheDocument();
      expect(screen.getByText(/Dialogues: 2/)).toBeInTheDocument();
    });

    test('UC-1.5: displays correct details for IDE mission scene', () => {
      const ideScene = {
        ...mockScene,
        type: 'ide' as const,
        missionId: 'mission-001',
        title: 'Variables Lesson',
      };

      render(
        <SortableSceneItem scene={ideScene} index={0} onDelete={mockOnDelete} />
      );

      expect(screen.getByText(/mission-001/)).toBeInTheDocument();
      expect(screen.getByText(/Variables Lesson/)).toBeInTheDocument();
    });

    test('UC-1.5: displays correct details for choice scene', () => {
      const choiceScene = {
        ...mockScene,
        type: 'choice' as const,
        question: 'What is the capital of France?',
      };

      render(
        <SortableSceneItem
          scene={choiceScene}
          index={0}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText(/What is the capital of France/)
      ).toBeInTheDocument();
    });

    test('renders scene with correct index number', () => {
      const { container } = render(
        <SortableSceneItem scene={mockScene} index={5} onDelete={mockOnDelete} />
      );

      const sceneNumber = container.querySelector('[class*="scene-number"]');
      expect(sceneNumber?.textContent).toBe('6'); // index + 1
    });
  });

  describe('Delete Button', () => {
    test('UC-1.3: calls onDelete with scene id when delete button clicked', () => {
      render(
        <SortableSceneItem scene={mockScene} index={0} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('scene-1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    test('delete button is accessible', () => {
      render(
        <SortableSceneItem scene={mockScene} index={0} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeVisible();
      expect(deleteButton).toBeEnabled();
    });
  });

  describe('Edge Cases', () => {
    test('EC-4.1: handles very long NPC names', () => {
      const longNameScene = {
        ...mockScene,
        npcName: 'A'.repeat(200),
      };

      const { container } = render(
        <SortableSceneItem
          scene={longNameScene}
          index={0}
          onDelete={mockOnDelete}
        />
      );

      // Should not break layout
      expect(container.querySelector('[class*="scene-info"]')).toBeInTheDocument();
    });

    test('EC-4.5: handles scenes with missing optional fields', () => {
      const minimalScene = {
        id: 'scene-2',
        type: 'story' as const,
        character: 'tom_nook',
        npcName: 'Tom Nook',
      };

      render(
        <SortableSceneItem
          scene={minimalScene}
          index={0}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Tom Nook', { exact: false })).toBeInTheDocument();
    });

    test('handles scene with empty dialogues array', () => {
      const sceneWithEmptyDialogues = {
        ...mockScene,
        dialogues: [],
      };

      render(
        <SortableSceneItem
          scene={sceneWithEmptyDialogues}
          index={0}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Dialogues: 0/)).toBeInTheDocument();
    });
  });
});
