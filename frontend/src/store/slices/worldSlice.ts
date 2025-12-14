import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TileType = 'grass' | 'water' | 'sand' | 'stone' | 'dirt' | 'weed';

export interface TileData {
    x: number;
    y: number;
    type: TileType;
    object?: string; // e.g., 'tree', 'rock', 'house', 'flower'
}

export interface WorldState {
    width: number;
    height: number;
    tiles: TileData[][];
}

const generateInitialGrid = (width: number, height: number): TileData[][] => {
    return Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => ({
            x,
            y,
            type: 'grass',
        }))
    );
};

const initialState: WorldState = {
    width: 10,
    height: 10,
    tiles: generateInitialGrid(10, 10),
};

export const worldSlice = createSlice({
    name: 'world',
    initialState,
    reducers: {
        initializeWorld: (state, action: PayloadAction<{ width: number; height: number }>) => {
            state.width = action.payload.width;
            state.height = action.payload.height;
            state.tiles = generateInitialGrid(action.payload.width, action.payload.height);
        },
        setTile: (state, action: PayloadAction<{ x: number; y: number; type: TileType; object?: string }>) => {
            const { x, y, type, object } = action.payload;
            if (state.tiles[y] && state.tiles[y][x]) {
                state.tiles[y][x] = { ...state.tiles[y][x], type, object: object !== undefined ? object : state.tiles[y][x].object };
            }
        },
        updateTileObject: (state, action: PayloadAction<{ x: number; y: number; object: string | undefined }>) => {
            const { x, y, object } = action.payload;
            if (state.tiles[y] && state.tiles[y][x]) {
                state.tiles[y][x].object = object;
            }
        }
    },
});

export const { initializeWorld, setTile, updateTileObject } = worldSlice.actions;
export const selectWorld = (state: { world: WorldState }) => state.world;
export default worldSlice.reducer;
