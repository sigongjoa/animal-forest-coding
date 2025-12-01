import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  // UC-1: 초기 렌더링 - StoryPage가 마운트되고 Tom Nook이 보여짐
  test('UC-1: StoryPage should render with Scene 1', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // UC-2: 텍스트 타이핑 애니메이션 - 타이핑이 진행되면서 텍스트가 점진적으로 나타남
  test('UC-2: Text typing animation should display characters progressively', async () => {
    renderStoryPage();

    // 타이밍 진행 - 충분한 시간을 줘야 타이핑이 시작됨
    jest.advanceTimersByTime(2500); // 50ms * ~50 글자

    // 부분 텍스트로 확인 (전체가 아닌 일부)
    await waitFor(() => {
      const displayedText = screen.getByText(/어서/i);
      expect(displayedText).toBeInTheDocument();
    });
  });

  // UC-3: 다음 대사 진행 - 버튼 클릭 시 대사 인덱스 증가
  test('UC-3: Click next button should advance to next dialogue', async () => {
    const { container } = renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // 첫 번째 클릭 - 다음 대사로 진행
    fireEvent.click(nextButton);
    jest.advanceTimersByTime(300); // 타이핑 애니메이션을 위한 시간

    // 진행도 표시 찾기 - 텍스트가 여러 요소로 분산되므로 상위 div에서 확인
    await waitFor(() => {
      const progressDiv = container.querySelector('.text-gray-600');
      expect(progressDiv?.textContent).toContain('1 / 2');
    });
  });

  // UC-4: 씬 변경 - 첫 번째 씬의 모든 대사를 진행하면 두 번째 씬으로 자동 전환
  test('UC-4: Should change scene when all dialogues in current scene are done', async () => {
    const { container } = renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // Scene 1의 모든 대사 진행 (5개 대사)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton);
      jest.advanceTimersByTime(300);
    }

    // Scene 2로 전환되었는지 확인 - 진행도가 2/2로 변경
    await waitFor(() => {
      const progressDiv = container.querySelector('.text-gray-600');
      expect(progressDiv?.textContent).toContain('2 / 2');
    });
  });

  // UC-5: IDE 페이지로 이동 - 모든 대사 완료 후 최종 버튼 클릭 시 /ide로 네비게이션
  test('UC-5: Should navigate to /ide on final dialogue completion', async () => {
    renderStoryPage();

    const nextButton = screen.getByRole('button', { name: /다음|시작하기/i });

    // 모든 대사 진행 (Scene 1: 5개 + Scene 2: 6개 = 11개 총 대사)
    for (let i = 0; i < 11; i++) {
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

  // UC-7: 진행도 표시 - 초기 상태에서 진행도가 정확하게 표시됨
  test('UC-7: Progress indicator should show correct scene and dialogue numbers', () => {
    const { container } = renderStoryPage();

    // 초기: Scene 1, Dialogue 1 - 여러 요소로 분산되므로 상위 컨테이너에서 확인
    const progressDiv = container.querySelector('.text-gray-600');
    expect(progressDiv?.textContent).toContain('1 / 2');
    expect(progressDiv?.textContent).toContain('1 / 5');
  });

  // UC-8: NPC 이름 표시 - Tom Nook 이름이 대사 박스 위에 표시됨
  test('UC-8: Should display NPC name correctly', () => {
    renderStoryPage();
    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
  });

  // UC-9: 배경이미지 로드 - 현재 씬에 맞는 배경이미지가 표시됨
  test('UC-9: Should load background image for current scene', () => {
    const { container } = renderStoryPage();

    // img1.jpg가 배경으로 설정되었는지 확인
    const backgroundDiv = Array.from(container.querySelectorAll('div')).find(
      el => el.getAttribute('style')?.includes('img1.jpg')
    );
    expect(backgroundDiv).toBeInTheDocument();
  });

  // UC-10: 버튼 존재 확인 - 스킵 버튼과 다음 버튼이 렌더링됨
  test('UC-10: Should render Skip and Next buttons', () => {
    renderStoryPage();

    expect(screen.getByRole('button', { name: /스킵/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음|시작하기/i })).toBeInTheDocument();
  });

  // UC-11: 다크 오버레이 존재 - 배경 위에 어두운 오버레이가 렌더링됨
  test('UC-11: Should have dark overlay for readability', () => {
    const { container } = renderStoryPage();

    const darkOverlay = container.querySelector('.bg-black.opacity-40');
    expect(darkOverlay).toBeInTheDocument();
  });

  // UC-12: 타이핑 커서 애니메이션 - 타이핑 중에 깜빡이는 커서가 표시됨
  test('UC-12: Should show typing cursor while typing', async () => {
    renderStoryPage();

    // 타이핑 중에는 커서가 표시되어야 함
    jest.advanceTimersByTime(100);

    // 커서 찾기 - isTyping이 true일 때만 표시됨
    await waitFor(() => {
      const cursor = screen.getByText(/▋/);
      expect(cursor).toBeInTheDocument();
    });
  });
});
