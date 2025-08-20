import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export type LocationState = {
  isLocationSet: boolean;
  coords: Coordinates | null;
  address: string | null;
  detectedAt: number | null;
};

const initialState: LocationState = {
  isLocationSet: false,
  coords: null,
  address: null,
  detectedAt: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<{ coords: Coordinates; address: string | null }>) {
      state.coords = action.payload.coords;
      state.address = action.payload.address;
      state.isLocationSet = true;
      state.detectedAt = Date.now();
    },
    clearLocation(state) {
      state.coords = null;
      state.address = null;
      state.isLocationSet = false;
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
