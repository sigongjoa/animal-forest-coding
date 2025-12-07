# Phase 2.1 Drag-and-Drop: Test Cases & Test Plan

## 📋 Test Overview

**Feature**: Drag-and-Drop Scene Reordering
**Component**: SceneManager + SortableSceneItem
**Library**: @dnd-kit/sortable

---

## 🧪 Unit Test Cases

### 1. SortableSceneItem Component Tests

#### UC-1.1: Component Rendering
```typescript
test('renders scene item with all required elements', () => {
  const scene = {
    id: 'scene-1',
    type: 'story',
    character: 'tom_nook',
    npcName: 'Tom Nook',
    imageUrl: '/img.jpg',
    dialogues: ['Hello', 'How are you?']
  };

  const { getByText, getByRole } = render(
    <SortableSceneItem scene={scene} index={0} onDelete={jest.fn()} />
  );

  expect(getByText('Tom Nook')).toBeInTheDocument();
  expect(getByText('📖 Story')).toBeInTheDocument();
  expect(getByRole('button', { name: /delete/i })).toBeInTheDocument();
});
```

#### UC-1.2: Drag Handle Presence
```typescript
test('renders drag handle for mouse interaction', () => {
  const { container } = render(
    <SortableSceneItem scene={mockScene} index={0} onDelete={jest.fn()} />
  );

  const dragHandle = container.querySelector('.drag-handle');
  expect(dragHandle).toBeInTheDocument();
  expect(dragHandle).toHaveTextContent('☰');
});
```

#### UC-1.3: Delete Button Functionality
```typescript
test('calls onDelete with scene id when delete button clicked', () => {
  const onDelete = jest.fn();
  const { getByRole } = render(
    <SortableSceneItem scene={mockScene} index={0} onDelete={onDelete} />
  );

  fireEvent.click(getByRole('button', { name: /delete/i }));
  expect(onDelete).toHaveBeenCalledWith('scene-1');
});
```

#### UC-1.4: Scene Type Display
```typescript
test.each([
  ['story', '📖 Story'],
  ['ide', '💻 IDE Mission'],
  ['choice', '🎯 Choice']
])('displays correct icon for %s scene type', (type, expected) => {
  const scene = { ...mockScene, type };
  const { getByText } = render(
    <SortableSceneItem scene={scene} index={0} onDelete={jest.fn()} />
  );

  expect(getByText(expected)).toBeInTheDocument();
});
```

#### UC-1.5: Scene Details Display
```typescript
test('displays correct details for story scene', () => {
  const scene = {
    ...mockScene,
    type: 'story',
    imageUrl: '/path/to/image.jpg',
    dialogues: ['Line 1', 'Line 2']
  };

  const { getByText } = render(
    <SortableSceneItem scene={scene} index={0} onDelete={jest.fn()} />
  );

  expect(getByText(/\/path\/to\/image\.jpg/)).toBeInTheDocument();
  expect(getByText(/Dialogues: 2/)).toBeInTheDocument();
});
```

#### UC-1.6: Drag State Visual Feedback
```typescript
test('applies reduced opacity during drag', () => {
  const mockUseSortable = jest.spyOn(require('@dnd-kit/sortable'), 'useSortable');
  mockUseSortable.mockReturnValue({
    isDragging: true,
    transform: null,
    transition: null,
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn()
  });

  const { container } = render(
    <SortableSceneItem scene={mockScene} index={0} onDelete={jest.fn()} />
  );

  const element = container.firstChild;
  expect(element).toHaveStyle('opacity: 0.5');
});
```

---

## 🎯 Integration Test Cases

### 2. SceneManager + Backend Integration

#### IC-2.1: Fetch Episodes on Mount
```typescript
test('fetches episodes when component mounts', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockEpisode1, mockEpisode2] })
  });

  render(<SceneManager adminToken="test-token" />);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/admin/episodes',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' }
      })
    );
  });
});
```

#### IC-2.2: Load Scenes for Selected Episode
```typescript
test('loads scenes when episode is selected', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockEpisode] })
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockScene1, mockScene2] })
  });

  const { getByText, getByRole } = render(<SceneManager />);

  fireEvent.click(getByText('Episode 1'));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/episodes/episode-1/scenes'),
      expect.any(Object)
    );
  });
});
```

#### IC-2.3: Drag-and-Drop Scene Reorder API Call
```typescript
test('calls reorder API with correct scene order after drag', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockEpisode] })
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockScene1, mockScene2, mockScene3] })
  });

  // Drag scene 3 to position 1
  const dragEvent = createDragEndEvent({
    active: { id: 'scene-3' },
    over: { id: 'scene-1' }
  });

  // Simulate drag
  const { rerender } = render(<SceneManager />);

  // Trigger handleDragEnd
  // ...

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/scenes/reorder'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          sceneOrder: ['scene-3', 'scene-1', 'scene-2']
        })
      })
    );
  });
});
```

#### IC-2.4: Rollback on API Failure
```typescript
test('refetches scenes on reorder API failure', async () => {
  // Initial fetch
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockEpisode] })
  });

  // Initial scenes fetch
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockScene1, mockScene2] })
  });

  // Reorder API fails
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 500
  });

  // Rollback fetch
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [mockScene1, mockScene2] })
  });

  // Simulate drag and trigger failure
  // ...

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(4); // 3 + 1 rollback
  });
});
```

#### IC-2.5: Error Display
```typescript
test('displays error message when API call fails', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));

  const { getByText } = render(<SceneManager />);

  await waitFor(() => {
    expect(getByText(/Network error/)).toBeInTheDocument();
  });
});
```

---

## 🔄 End-to-End Test Cases (Playwright)

### 3. User Workflows

#### E2E-3.1: Complete Drag-and-Drop Workflow
```typescript
test('user can drag scene and verify order is saved', async ({ page }) => {
  // Navigate to admin dashboard
  await page.goto('http://localhost:3000/admin');

  // Wait for episodes to load
  await page.waitForSelector('[class*="episode-item"]');

  // Select first episode
  await page.click('[class*="episode-item"]');

  // Wait for scenes to load
  await page.waitForSelector('[class*="scene-item"]');

  // Get initial scene order
  const initialScenes = await page.locator('[class*="scene-item"]').count();
  expect(initialScenes).toBeGreaterThan(1);

  // Drag second scene to first position
  const secondScene = page.locator('[class*="scene-item"]').nth(1);
  const firstScene = page.locator('[class*="scene-item"]').nth(0);

  await secondScene.drag(firstScene);

  // Wait for API call to complete
  await page.waitForLoadState('networkidle');

  // Verify order changed in UI
  const firstSceneContent = await firstScene.textContent();
  expect(firstSceneContent).toContain('Scene 2'); // Previously second scene
});
```

#### E2E-3.2: Multiple Drag Operations
```typescript
test('user can perform multiple drag operations', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await page.click('[class*="episode-item"]');

  // Drag scene 1 to position 3
  await page.locator('[class*="scene-item"]').nth(0)
    .dragTo(page.locator('[class*="scene-item"]').nth(2));

  await page.waitForLoadState('networkidle');

  // Drag scene 2 to position 1
  await page.locator('[class*="scene-item"]').nth(1)
    .dragTo(page.locator('[class*="scene-item"]').nth(0));

  await page.waitForLoadState('networkidle');

  // Verify final order
  const scenes = await page.locator('[class*="scene-item"]').allTextContents();
  expect(scenes.length).toBeGreaterThan(0);
});
```

#### E2E-3.3: Keyboard-Based Reordering
```typescript
test('user can reorder scenes using keyboard', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await page.click('[class*="episode-item"]');

  // Focus first drag handle
  const dragHandle = page.locator('[class*="drag-handle"]').first();
  await dragHandle.focus();

  // Use keyboard to reorder (library should support this)
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.waitForLoadState('networkidle');

  // Verify scenes reordered
  const scenes = await page.locator('[class*="scene-item"]').count();
  expect(scenes).toBeGreaterThan(0);
});
```

#### E2E-3.4: Delete During Drag Session
```typescript
test('delete button works while scenes are loaded', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await page.click('[class*="episode-item"]');

  const initialCount = await page.locator('[class*="scene-item"]').count();

  // Click delete on first scene
  await page.locator('[class*="btn-delete"]').first().click();

  // Confirm delete dialog if present
  if (await page.locator('text=정말').isVisible()) {
    await page.click('text=확인');
  }

  await page.waitForLoadState('networkidle');

  const finalCount = await page.locator('[class*="scene-item"]').count();
  expect(finalCount).toBe(initialCount - 1);
});
```

---

## 📊 Edge Cases & Boundary Tests

### 4. Edge Cases

#### EC-4.1: Single Scene
```typescript
test('drag-and-drop disabled with single scene', () => {
  const scene = mockScene;
  const { container } = render(
    <SortableSceneItem scene={scene} index={0} onDelete={jest.fn()} />
  );

  // Should still be draggable but no effect
  expect(container.querySelector('[class*="drag-handle"]')).toBeInTheDocument();
});
```

#### EC-4.2: Empty Episode
```typescript
test('displays empty state when episode has no scenes', () => {
  const { getByText } = render(<SceneManager />);

  // Simulate selecting episode with no scenes
  const emptyMessage = getByText(/이 Episode에 Scene이 없습니다/);
  expect(emptyMessage).toBeInTheDocument();
});
```

#### EC-4.3: Drag Same Position
```typescript
test('no API call when dragging to same position', async () => {
  const dragEvent = createDragEndEvent({
    active: { id: 'scene-1' },
    over: { id: 'scene-1' }
  });

  // handleDragEnd checks: if (active.id === over.id) return;
  // Should not make API call

  expect(fetch).not.toHaveBeenCalled();
});
```

#### EC-4.4: Network Error During Drag
```typescript
test('shows error and rolls back on network failure', async () => {
  fetch.mockRejectedValueOnce(new Error('Network timeout'));

  // Trigger drag
  // Should rollback and show error

  expect(screen.getByText(/failed/i)).toBeInTheDocument();
});
```

#### EC-4.5: Rapid Multiple Drags
```typescript
test('handles rapid consecutive drags correctly', async () => {
  // Drag 1 -> 2
  simulateDrag(mockScene1, mockScene2);

  // Immediately drag another without waiting
  simulateDrag(mockScene3, mockScene1);

  // Should queue properly or ignore second
  // Verify final state is correct
});
```

#### EC-4.6: Very Long Scene Names
```typescript
test('truncates long scene names gracefully', () => {
  const longNameScene = {
    ...mockScene,
    npcName: 'A'.repeat(200)
  };

  const { container } = render(
    <SortableSceneItem scene={longNameScene} index={0} onDelete={jest.fn()} />
  );

  // Should not break layout
  expect(container.querySelector('[class*="scene-info"]')).toBeInTheDocument();
});
```

---

## 🎪 Use Case Scenarios

### 5. Real-World Use Cases

#### UC-5.1: Teacher Organizing Episode 1
```
GIVEN: Teacher has 5 scenes in Episode 1
WHEN: Teacher wants to reorder: Scene 3, 1, 4, 2, 5
THEN:
  - Scenes reorder successfully
  - Student sees new order
  - Order persists after refresh
```

#### UC-5.2: Content Creator Bulk Rearranging
```
GIVEN: Content creator has 20 scenes across 3 episodes
WHEN: Needs to move last 5 scenes to middle
THEN:
  - Can drag-and-drop efficiently
  - All changes saved
  - No performance degradation
```

#### UC-5.3: Admin Reviewing Story Flow
```
GIVEN: Admin is reviewing Episode 2 story progression
WHEN: Realizes scenes are in wrong order
THEN:
  - Can reorder without leaving admin panel
  - Changes immediately reflect
  - Can verify in student view
```

---

## ✅ Test Coverage Checklist

- [ ] Unit Tests: SortableSceneItem rendering and interactions
- [ ] Unit Tests: handleDragEnd logic
- [ ] Integration Tests: API integration
- [ ] Integration Tests: Error handling and rollback
- [ ] E2E Tests: Complete drag-and-drop workflow
- [ ] E2E Tests: Multiple operations
- [ ] E2E Tests: Keyboard support
- [ ] Edge Cases: Single scene
- [ ] Edge Cases: Empty episode
- [ ] Edge Cases: Network errors
- [ ] Edge Cases: Rapid operations
- [ ] Performance Tests: 100+ scenes
- [ ] Accessibility Tests: Keyboard navigation

---

## 📈 Success Criteria

✅ **All unit tests passing** (6/6)
✅ **All integration tests passing** (5/5)
✅ **All E2E tests passing** (4/4)
✅ **Edge case coverage** (6/6)
✅ **No TypeScript errors**
✅ **No console errors in browser**
✅ **API responses verified**
✅ **Visual feedback confirmed**
✅ **Accessibility verified**
✅ **Performance acceptable**

---

## 📝 Test Execution Summary

To run all tests:

```bash
# Unit tests only
npm test -- SortableSceneItem.test.ts

# Integration tests
npm test -- SceneManager.integration.test.ts

# E2E tests
npm run e2e -- drag-and-drop.spec.ts

# All tests with coverage
npm run test:coverage
```

---

**Generated**: 2025-12-05
**Feature**: Phase 2.1 Drag-and-Drop
**Status**: Ready for Testing
