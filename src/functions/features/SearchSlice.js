import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'


const initialState = {
    searchParams: {
      origin: '',
      destination: '',
      departure_date: '',
      return_date: '',
      passengers: 1,
      class: '',
    },
    loading: false,
    offers: null,
    error: null,
  };
  
  export const fetchOffersBySearch = createAsyncThunk(
    'search/fetchOffersBySearch',
    async (searchParams, { rejectWithValue }) => {
      try {
        const response = await axios.post('http://localhost:8080/offers', searchParams);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
      setSearchParams: (state, action) => {
        state.searchParams = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchOffersBySearch.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchOffersBySearch.fulfilled, (state, action) => {
          state.loading = false;
          state.offers = action.payload;
        })
        .addCase(fetchOffersBySearch.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
export const { setSearchParams } = searchSlice.actions;
export default searchSlice.reducer;