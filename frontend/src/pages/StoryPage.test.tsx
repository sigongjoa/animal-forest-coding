import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StoryPage from './StoryPage';
import progressionReducer, { initialState } from '../store/slices/progressionSlice';

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
      ...initialState,
      studentId: 'test-student',
      episodeId: 'ep_1',
      lastModified: Date.now(),
      isSynced: true,
      lastSyncedAt: Date.now(),
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

  test('UC-1: StoryPage should render with Scene 1', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook', { exact: false })).toBeInTheDocument();
  });

  test('UC-2: Text typing animation should display characters progressively', async () => {
    renderStoryPage();
    jest.advanceTimersByTime(2500);
    await waitFor(() => {
      const displayedText = screen.getByText(/어서/i);
      expect(displayedText).toBeInTheDocument();
    });
  });

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

  test('UC-6: Skip button should navigate to /ide immediately', () => {
    renderStoryPage();
    const skipButton = screen.getByRole('button', { name: /스킵/i });
    fireEvent.click(skipButton);
    expect(mockNavigate).toHaveBeenCalledWith('/ide');
  });

  test('UC-7: Progress indicator should show correct scene and dialogue numbers', () => {
    const { container } = renderStoryPage();
    const progressDiv = container.querySelector('.text-gray-600');
    expect(progressDiv?.textContent).toContain('1 / 2');
  });

  test('UC-8: Should display NPC name correctly', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook', { exact: false })).toBeInTheDocument();
  });

  test('UC-9: Should load background image for current scene', () => {
    const { container } = renderStoryPage();
    const backgroundDiv = Array.from(container.querySelectorAll('div')).find(
      el => el.getAttribute('style')?.includes('img1.jpg')
    );
    expect(backgroundDiv).toBeInTheDocument();
  });

  test('UC-10: Should render Skip and Next buttons', () => {
    renderStoryPage();
    expect(screen.getByRole('button', { name: /스킵/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음|시작하기/i })).toBeInTheDocument();
  });

  test('UC-11: Should have dark overlay for readability', () => {
    const { container } = renderStoryPage();
    const darkOverlay = container.querySelector('.bg-black.opacity-40');
    expect(darkOverlay).toBeInTheDocument();
  });

  test('UC-12: Should show typing cursor while typing', async () => {
    renderStoryPage();
    jest.advanceTimersByTime(100);
    await waitFor(() => {
      const cursor = screen.getByText(/▋/);
      expect(cursor).toBeInTheDocument();
    });
  });
});
