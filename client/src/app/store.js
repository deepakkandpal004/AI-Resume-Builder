import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import atsReducer from './features/atsSlice'
import coverLetterReducer from './features/coverLetterSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ats: atsReducer,
        coverLetter: coverLetterReducer,
    },
})
