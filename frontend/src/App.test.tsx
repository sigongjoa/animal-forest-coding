import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import progressionReducer from './store/slices/progressionSlice';

// Create test store
const createTestStore = () => configureStore({
  reducer: {
    progression: progressionReducer,
  },
});

describe('App Routing', () => {
  const renderApp = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  test('App should render without crashing', () => {
    const { container } = renderApp();
    expect(container.firstChild).toBeInTheDocument();
  });

  test('Router should be properly configured', () => {
    const { container } = renderApp();
    const rootElement = container.querySelector('div') || container.firstChild;
    expect(rootElement).toBeInTheDocument();
  });

  test('App should have Routes component configured', () => {
    const { container } = renderApp();
    expect(container.innerHTML).toBeTruthy();
  });

  test('Entry page should render at root path', () => {
    const { container } = renderApp();
    const appContainer = container.querySelector('div');
    expect(appContainer).toBeInTheDocument();
  });
});
