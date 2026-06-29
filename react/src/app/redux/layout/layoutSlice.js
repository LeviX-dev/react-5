import { createSlice } from "@reduxjs/toolkit";
import { layoutSettings } from "app/layouts/settings";

const initialState = {
  settings: { ...layoutSettings },
  defaultSettings: { ...layoutSettings }
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setLayoutSettings: (state, action) => {
      state.settings = action.payload;
    },
    setDefaultSettings: (state, action) => {
      state.defaultSettings = action.payload;
    }
  }
});

export const { setLayoutSettings, setDefaultSettings } = layoutSlice.actions;
export default layoutSlice.reducer;
