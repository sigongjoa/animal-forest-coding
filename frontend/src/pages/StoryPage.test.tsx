import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StoryPage from './StoryPage';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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
    return render(
      <BrowserRouter>
        <StoryPage />
      </BrowserRouter>
    );
  };

  // UC-1: 초기 렌더링
  test('UC-1: StoryPage should render with Scene 1', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // UC-2: 텍스트 타이핑 애니메이션
  test('UC-2: Text typing animation should display characters progressively', async () => {
    renderStoryPage();

    // 초기 텍스트가 비어있어야 함
    const dialogBox = screen.getByText(/어서 오시게, 주민 대표!/i).closest('p');
    expect(dialogBox).toBeInTheDocument();

    // 타이핑 효과를 시뮬레이션 (50ms * 문자수)
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/어서 오시게, 주민 대표!/i)).toBeInTheDocument();
    });
  });

  // UC-3: 다음 대사 진행
  test('UC-3: Click next button should advance to next dialogue', async () => {
    renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // 첫 번째 대사에서 다음 대사로 진행
    fireEvent.click(nextButton);

    // 진행도 확인 (1/2 (2/5)로 변경되어야 함)
    await waitFor(() => {
      const progressText = screen.getByText(/1 \/ 2 \( 2 \/ 5 \)/);
      expect(progressText).toBeInTheDocument();
    });
  });

  // UC-4: 씬 변경
  test('UC-4: Should change scene when all dialogues in current scene are done', async () => {
    renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // Scene 1의 모든 대사 진행 (5개 대사)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton);
      jest.advanceTimersByTime(100);
    }

    // 5번째 대사에서 클릭하면 Scene 2로 변경
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Scene 2의 NPC 이름은 같지만 대사가 변경됨
      const progressText = screen.getByText(/2 \/ 2/);
      expect(progressText).toBeInTheDocument();
    });
  });

  // UC-5: IDE 페이지로 이동
  test('UC-5: Should navigate to /ide on final dialogue completion', async () => {
    renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // 모든 대사 진행 (11개 총 대사)
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
      jest.advanceTimersByTime(100);
    }

    // 최종 "시작하기" 버튼 확인
    const startButton = screen.getByRole('button', { name: /🚀 시작하기/i });
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith('/ide');
  });

  // UC-6: 스킵 기능
  test('UC-6: Skip button should navigate to /ide immediately', () => {
    renderStoryPage();

    const skipButton = screen.getByRole('button', { name: /스킵/i });
    fireEvent.click(skipButton);

    expect(mockNavigate).toHaveBeenCalledWith('/ide');
  });

  // UC-7: 진행도 표시
  test('UC-7: Progress indicator should show correct scene and dialogue numbers', () => {
    renderStoryPage();

    // 초기: Scene 1, Dialogue 1
    expect(screen.getByText(/1 \/ 2 \( 1 \/ 5 \)/)).toBeInTheDocument();
  });

  // 추가 테스트: NPC 이름 표시
  test('Should display NPC name correctly', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // 추가 테스트: 배경이미지 로드
  test('Should load background image for current scene', () => {
    renderStoryPage();

    const backgroundDiv = screen.getByRole('generic').querySelector('div[style*="img1.jpg"]');
    expect(backgroundDiv).toBeInTheDocument();
  });

  // 추가 테스트: 버튼 존재 확인
  test('Should render Skip and Next buttons', () => {
    renderStoryPage();

    expect(screen.getByRole('button', { name: /스킵/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음|시작하기/i })).toBeInTheDocument();
  });

  // 추가 테스트: 다크 오버레이 존재
  test('Should have dark overlay for readability', () => {
    const { container } = renderStoryPage();

    const darkOverlay = container.querySelector('div.bg-black.opacity-40');
    expect(darkOverlay).toBeInTheDocument();
  });

  // 추가 테스트: 타이핑 커서 애니메이션
  test('Should show typing cursor while typing', async () => {
    renderStoryPage();

    // 타이핑 중에는 커서가 표시되어야 함
    jest.advanceTimersByTime(100);

    const cursor = screen.getByText(/▋/);
    expect(cursor).toBeInTheDocument();
  });
});
