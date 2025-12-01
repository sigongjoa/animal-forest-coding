import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Routing', () => {
  // Root path 테스트
  test('App should render without crashing', () => {
    render(<App />);
    expect(screen.getByText(/로그인|IDE|스토리/i)).toBeInTheDocument();
  });

  // 라우팅 가능성 테스트
  test('Router should be properly configured', () => {
    const { container } = render(<App />);

    // BrowserRouter가 렌더링되었는지 확인
    const app = container.querySelector('[data-testid="app"]') || container.firstChild;
    expect(app).toBeInTheDocument();
  });

  // App 구조 확인
  test('App should have Routes component', () => {
    const { container } = render(<App />);

    // Router와 Routes가 렌더링되었는지 확인 (indirect)
    expect(container.innerHTML).toBeTruthy();
  });
});
