import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Fix for toBeInTheDocument
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TileGridRenderer } from '../TileGridRenderer';
import worldReducer, { initializeWorld } from '../../store/slices/worldSlice';
import economyReducer, { setBells } from '../../store/slices/economySlice';

// Mock Store Setup
const createTestStore = () => {
    return configureStore({
        reducer: {
            world: worldReducer,
            economy: economyReducer,
            progression: (state = {}) => state // Mock other slices if needed
        }
    });
};

describe('TileGridRenderer', () => {
    let store: any;

    beforeEach(() => {
        store = createTestStore();
        store.dispatch(initializeWorld({ width: 2, height: 2 })); // Small 2x2 grid
        store.dispatch(setBells(500));
    });

    test('renders bells correctly', () => {
        render(
            <Provider store={store}>
                <TileGridRenderer />
            </Provider>
        );
        // Debug output
        screen.debug();
        console.log('Store State:', JSON.stringify(store.getState(), null, 2));

        expect(screen.getByText(/500 Bells/)).toBeInTheDocument();
    });

    test('renders grid tiles', () => {
        render(
            <Provider store={store}>
                <TileGridRenderer />
            </Provider>
        );
        screen.debug();
        console.log('Store State (Tiles):', JSON.stringify(store.getState().world, null, 2));
        // 2x2 = 4 tiles
        // We can check simply if tiles exist. 
        // Our CSS class is tile-cell.
        // We can't easily query by class in testing-library without setup, 
        // but we can query by title "(0, 0) grass"
        expect(screen.getByTitle('(0, 0) grass')).toBeInTheDocument();
        expect(screen.getByTitle('(1, 1) grass')).toBeInTheDocument();
    });
});
