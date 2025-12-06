import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StoryPage from './StoryPage';
import progressionReducer from '../store/slices/progressionSlice';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a mock store for testing
const createTestStore = () => configureStore({
  reducer: {
    progression: progressionReducer,
  },
  preloadedState: {
    progression: {
      studentId: 'test-student',
      episodeId: 'ep_1',
      completedMissions: [],
      currentMissionIndex: 0,
      points: 0,
      badges: [],
      lastModified: Date.now(),
    }
  }
});

describe('StoryPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderStoryPage = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <StoryPage />
        </BrowserRouter>
      </Provider>
    );
  };

  // UC-1:초기 렌더링
  test('UC-1: StoryPage should render with Scene 1', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // UC-2: 텍스트 타이핑 애니메이션
  test('UC-2: Text typing animation should display characters progressively', async () => {
    renderStoryPage();
    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      const displayedText = screen.getByText(/어서/i);
      expect(displayedText).toBeInTheDocument();
    });
  });

  // UC-3: 다음 대사 진행
  test('UC-3: Click next button should advance to next dialogue', async () => {
    const { container } = renderStoryPage();
    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });
    fireEvent.click(nextButton);
    jest.advanceTimersByTime(300);
    await waitFor(() => {
      const progressDiv = container.querySelector('.text-gray-600');
      expect(progressDiv?.textContent).toContain('1 / 2');
    });
  });

  // UC-4: 씬 변경
  test('UC-4: Should change scene when all dialogues in current scene are done', async () => {
    const { container } = renderStoryPage();
    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton);
      jest.advanceTimersByTime(300);
    }
    await waitFor(() => {
      const progressDiv = container.querySelector('.text-gray-600');
      expect(progressDiv?.textContent).toContain('2 / 2');
    });
  });

  // UC-5: IDE 이동
  test('UC-5: Should navigate to /ide on final dialogue completion', async () => {
    renderStoryPage();
    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });
    for (let i = 0; i < 11; i++) {
      fireEvent.click(nextButton);
      jest.advanceTimersByTime(100);
    }
    const startButton = screen.getByRole('button', { name: /🚀 시작하기/i });
    fireEvent.click(startButton);
    expect(mockNavigate).toHaveBeenCalledWith('/ide');
  });

  // UC-6: 스킵
  test('UC-6: Skip button should navigate to /ide immediately', () => {
    renderStoryPage();
    const skipButton = screen.getByRole('button', { name: /스킵/i });
    fireEvent.click(skipButton);
    expect(mockNavigate).toHaveBeenCalledWith('/ide');
  });

  // UC-7: 진행도 표시
  test('UC-7: Progress indicator should show correct scene and dialogue numbers', () => {
    const { container } = renderStoryPage();
    const progressDiv = container.querySelector('.text-gray-600');
    expect(progressDiv?.textContent).toContain('1 / 2');
    expect(progressDiv?.textContent).toContain('1 / 5');
  });

  // UC-8: NPC 이름
  test('UC-8: Should display NPC name correctly', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // UC-9: 배경 이미지
  test('UC-9: Should load background image for current scene', () => {
    const { container } = renderStoryPage();
    const backgroundDiv = Array.from(container.querySelectorAll('div')).find(
      el => el.getAttribute('style')?.includes('img1.jpg')
    );
    expect(backgroundDiv).toBeInTheDocument();
  });

  // UC-10: 버튼 존재
  test('UC-10: Should render Skip and Next buttons', () => {
    renderStoryPage();
    expect(screen.getByRole('button', { name: /스킵/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음|시작하기/i })).toBeInTheDocument();
  });

  // UC-11: 오버레이
  test('UC-11: Should have dark overlay for readability', () => {
    const { container } = renderStoryPage();
    const darkOverlay = container.querySelector('.bg-black.opacity-40');
    expect(darkOverlay).toBeInTheDocument();
  });

  // UC-12: 커서 애니메이션
  test('UC-12: Should show typing cursor while typing', async () => {
    renderStoryPage();
    jest.advanceTimersByTime(100);
    await waitFor(() => {
      const cursor = screen.getByText(/▋/);
      expect(cursor).toBeInTheDocument();
    });
  });
});
