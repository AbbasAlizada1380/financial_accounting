import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// 1. تابع injectStore را از apiClient وارد می‌کنیم.
import { injectStore } from '../api/apiClient';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 2. اینجا چرخه را می‌شکنیم!
// بعد از اینکه store به طور کامل ساخته شد، آن را به apiClient تزریق می‌کنیم.
injectStore(store);

export const persistor = persistStore(store);