import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EconomyState {
    bells: number;
}

const initialState: EconomyState = {
    bells: 0,
};

export const economySlice = createSlice({
    name: 'economy',
    initialState,
    reducers: {
        setBells: (state, action: PayloadAction<number>) => {
            state.bells = action.payload;
        },
        addBells: (state, action: PayloadAction<number>) => {
            state.bells += action.payload;
        },
        subtractBells: (state, action: PayloadAction<number>) => {
            state.bells = Math.max(0, state.bells - action.payload);
        },
    },
});

export const { setBells, addBells, subtractBells } = economySlice.actions;
export const selectBells = (state: { economy: EconomyState }) => state.economy.bells;
export default economySlice.reducer;
