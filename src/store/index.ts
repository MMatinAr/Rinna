import { configureStore } from "@reduxjs/toolkit";
import { cafeApi } from "../services/cafeApi";
import { distributorApi } from "../services/distributorApi";
import { manufacturerApi } from "../services/manufacturerApi";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [cafeApi.reducerPath]: cafeApi.reducer,
    [manufacturerApi.reducerPath]: manufacturerApi.reducer,
    [distributorApi.reducerPath]: distributorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(cafeApi.middleware)
      .concat(manufacturerApi.middleware)
      .concat(distributorApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
