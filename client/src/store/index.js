import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../services/api';
export const fetchMe = createAsyncThunk('auth/me', async () => (await api.get('/auth/me')).data.user);
export const login = createAsyncThunk('auth/login', async (c, { rejectWithValue }) => { try { return (await api.post('/auth/login', c)).data.user; } catch (e) { return rejectWithValue(errMsg(e)); } });
export const logout = createAsyncThunk('auth/logout', async () => { await api.post('/auth/logout'); });
const slice = createSlice({ name: 'auth', initialState: { user: null, ready: false, error: null, loading: false }, reducers: {},
  extraReducers: (b) => b
    .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.ready = true; }).addCase(fetchMe.rejected, (s) => { s.user = null; s.ready = true; })
    .addCase(login.pending, (s) => { s.loading = true; s.error = null; }).addCase(login.fulfilled, (s, a) => { s.user = a.payload; s.loading = false; })
    .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; }).addCase(logout.fulfilled, (s) => { s.user = null; }) });
export default configureStore({ reducer: { auth: slice.reducer } });
