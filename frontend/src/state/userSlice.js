import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import apiClient from '../api/apiClient'; // از apiClient جدید استفاده می‌کنیم

// Async Thunk برای ورود
export const loginUser = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.post('/auth/login', credentials);
        toast.success('Welcome back!');
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        return rejectWithValue(message);
    }
});

// Async Thunk برای ثبت‌نام
export const registerUser = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await apiClient.post('/auth/register', userData);
        toast.success('Registration successful! Please log in.');
        return data;
    } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
        return rejectWithValue(message);
    }
});

const initialState = {
    currentUser: null,
    accessToken: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null;
            state.accessToken = null;
            toast.success('You have been logged out.');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload.user;
                state.accessToken = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerUser.pending, (state) => { state.loading = true; })
            .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;