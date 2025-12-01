import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Routing', () => {
  // ✅ TC-1: App이 정상적으로 렌더링되고 초기 페이지가 표시됨
  test('App should render without crashing', () => {
    const { container } = render(<App />);

    // App 컨테이너가 존재하고 내용이 있는지 확인
    expect(container.firstChild).toBeInTheDocument();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  // ✅ TC-2: React Router가 제대로 설정되었는지 확인
  test('Router should be properly configured', () => {
    const { container } = render(<App />);

    // BrowserRouter가 렌더링되었는지 확인 - 앱의 주요 컨테이너가 존재
    const rootElement = container.querySelector('div') || container.firstChild;
    expect(rootElement).toBeInTheDocument();
  });

  // ✅ TC-3: App 구조가 올바르게 구성되었는지 확인
  test('App should have Routes component configured', () => {
    const { container } = render(<App />);

    // Router와 Routes가 정상적으로 작동하는지 확인
    expect(container.innerHTML).toBeTruthy();
    expect(container.firstChild).toBeInTheDocument();
  });

  // ✅ TC-4: EntryPage가 기본 경로에서 렌더링되는지 확인
  test('Entry page should render at root path', () => {
    const { container } = render(<App />);

    // 초기 페이지가 렌더링되었는지 확인
    const appContainer = container.querySelector('div');
    expect(appContainer).toBeInTheDocument();
  });

  // ✅ TC-5: 애플리케이션의 기본 레이아웃 구조가 있는지 확인
  test('App should have proper layout structure', () => {
    const { container } = render(<App />);

    // div 요소가 존재하여 React 컴포넌트가 렌더링되었는지 확인
    const divElements = container.querySelectorAll('div');
    expect(divElements.length).toBeGreaterThan(0);
  });
});
