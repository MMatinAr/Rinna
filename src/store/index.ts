import { configureStore } from "@reduxjs/toolkit";
import { cafeApi } from "../services/cafeApi";
import { manufacturerApi } from "../services/manufacturerApi";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [cafeApi.reducerPath]: cafeApi.reducer,
    [manufacturerApi.reducerPath]: manufacturerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(cafeApi.middleware)
      .concat(manufacturerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
