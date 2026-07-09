import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './features/authSlice'
import atsReducer from './features/atsSlice'
import coverLetterReducer from './features/coverLetterSlice'
import interviewReducer from './features/interviewSlice'
import tailorReducer from './features/tailorSlice'
import resumeScoreReducer from './features/resumeScoreSlice'

// Persist configuration
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist auth state (token, user)
    // blacklist other slices that contain temporary/session data
}

const rootReducer = combineReducers({
    auth: authReducer,
    ats: atsReducer,
    coverLetter: coverLetterReducer,
    interview: interviewReducer,
    tailor: tailorReducer,
    resumeScore: resumeScoreReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types from redux-persist
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
})

export const persistor = persistStore(store)

