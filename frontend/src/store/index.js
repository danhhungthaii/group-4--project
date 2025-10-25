/**
 * Redux Store Configuration
 * Hoạt động 6: Redux & Protected Routes
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;