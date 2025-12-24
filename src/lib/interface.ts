import { createAppSlice } from "./createAppSlice";

export interface InterfaceState { }

const initialState: InterfaceState = {};

// If you are not using async thunks you can use the standalone `createSlice`.
export const interfaceSlice = createAppSlice({
  name: "interface",
  initialState,
  reducers: (create) => ({}),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {},
});

// Action creators are generated for each case reducer function.
export const { } = interfaceSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { } = interfaceSlice.selectors;
