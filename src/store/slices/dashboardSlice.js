import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardData, generateDummyData, fetchUsers, fetchClubs, fetchCountries } from '../../services/api';

const initialState = {
  filters: {
    country: ['all'],
    club: ['all'],
    assignedUser: ['all'],
    dateRange: 'last-30-days',
    leadSource: ['all'],
    customStartDate: null,
    customEndDate: null,
  },
  salesMetrics: null,
  onboardingMetrics: null,
  defaulterMetrics: null,
  users: [],
  usersLoading: false,
  usersError: null,
  countries: [], // Will be loaded from API
  countriesLoading: false,
  countriesError: null,
  clubs: [], // Will be loaded from API
  clubsLoading: false,
  clubsError: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for fetching dashboard data
export const loadDashboardData = createAsyncThunk(
  'dashboard/loadData',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchDashboardData(filters);
      return data;
    } catch (error) {
      console.warn('API failed, using dummy data:', error);
      // Fallback to dummy data if API fails
      return generateDummyData(filters);
    }
  }
);

// Async thunk for fetching users
export const loadUsers = createAsyncThunk(
  'dashboard/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUsers();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching clubs
export const loadClubs = createAsyncThunk(
  'dashboard/loadClubs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClubs();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching countries
export const loadCountries = createAsyncThunk(
  'dashboard/loadCountries',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCountries();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.salesMetrics = action.payload.salesMetrics;
        state.onboardingMetrics = action.payload.onboardingMetrics;
        state.defaulterMetrics = action.payload.defaulterMetrics;
        // Do not update clubs here; clubs are loaded separately
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load dashboard data';
      })
      .addCase(loadUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || 'Failed to load users';
      })
      .addCase(loadClubs.pending, (state) => {
        state.clubsLoading = true;
        state.clubsError = null;
      })
      .addCase(loadClubs.fulfilled, (state, action) => {
        state.clubsLoading = false;
        state.clubs = action.payload;
      })
      .addCase(loadClubs.rejected, (state, action) => {
        state.clubsLoading = false;
        state.clubsError = action.payload || 'Failed to load clubs';
      })
      .addCase(loadCountries.pending, (state) => {
        state.countriesLoading = true;
        state.countriesError = null;
      })
      .addCase(loadCountries.fulfilled, (state, action) => {
        state.countriesLoading = false;
        state.countries = action.payload;
      })
      .addCase(loadCountries.rejected, (state, action) => {
        state.countriesLoading = false;
        state.countriesError = action.payload || 'Failed to load countries';
      });
  },
});

export const { updateFilters, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;