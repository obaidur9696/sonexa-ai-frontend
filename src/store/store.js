import { configureStore } from '@reduxjs/toolkit';
import { authApi }    from './api/authApi';
import { sessionApi } from './api/sessionApi';
import { projectApi } from './api/projectApi'; // ✅ Import projectApi

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]:    authApi.reducer,
    [sessionApi.reducerPath]: sessionApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer, // ✅ Add projectApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      sessionApi.middleware,
      projectApi.middleware // ✅ Add projectApi middleware
    ),
});