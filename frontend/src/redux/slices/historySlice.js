import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch history
export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/ip/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Async thunk to delete history
export const deleteHistory = createAsyncThunk(
  "history/deleteHistory",
  async (ids, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/ip/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids },
        }
      );
      return { ids, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Slice
const historySlice = createSlice({
  name: "history",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHistory.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => !action.payload.ids.includes(item.id)
        );
      })
      .addCase(deleteHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default historySlice.reducer;
