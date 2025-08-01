import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardData, generateDashboardData, fetchUsers, fetchClubsAndCountries } from '../../services/api';

// Helper function to calculate date range parameters
export const calculateDateRangeParams = (dateRange, customStartDate = null, customEndDate = null) => {
  if (!dateRange || dateRange === 'all') {
    return { startDate: null, endDate: null };
  }

  if (dateRange === 'custom-range' && customStartDate && customEndDate) {
    return { startDate: customStartDate, endDate: customEndDate };
  }

  // Calculate start and end dates for predefined ranges
  const today = new Date();
  let startDate = new Date(today);
  
  if (dateRange === 'last-7-days') {
    startDate.setDate(today.getDate() - 6);
  } else if (dateRange === 'last-30-days') {
    startDate.setDate(today.getDate() - 29);
  } else if (dateRange === 'last-90-days') {
    startDate.setDate(today.getDate() - 89);
  } else if (dateRange === 'last-year') {
    startDate.setFullYear(today.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);
  }
  
  const format = (d) => d.toISOString().slice(0, 10);
  return { startDate: format(startDate), endDate: format(today) };
};

const initialState = {
  filters: {
    country: ['all'],
    club: ['all'],
    assignedUser: ['all'],
    dateRange: 'last-7-days',
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
  trendSums: null, // Add this line
  validLeadSources: [], // Add this line
  locations: [], // Add this line
};

// Async thunk for fetching dashboard data
export const loadDashboardData = createAsyncThunk(
  'dashboard/loadData',
  async (filters, { rejectWithValue }) => {
    try {
      // Always use the mapping function
      return await generateDashboardData(filters);
    } catch (error) {
      console.warn('API failed, using dummy data:', error);
      // Fallback to dummy data if API fails
      return generateDashboardData(filters);
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

// Async thunk for fetching both clubs and countries
export const loadClubsAndCountries = createAsyncThunk(
  'dashboard/loadClubsAndCountries',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClubsAndCountries();
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
        state.trendSums = action.payload.trendSums; // Add this line
        state.validLeadSources = action.payload.validLeadSources || [];
        state.locations = action.payload.locations || [];
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
      .addCase(loadClubsAndCountries.pending, (state) => {
        state.clubsLoading = true;
        state.countriesLoading = true;
        state.clubsError = null;
        state.countriesError = null;
      })
      .addCase(loadClubsAndCountries.fulfilled, (state, action) => {
        state.clubsLoading = false;
        state.countriesLoading = false;
        state.clubs = action.payload.clubs;
        state.countries = action.payload.countries;
      })
      .addCase(loadClubsAndCountries.rejected, (state, action) => {
        state.clubsLoading = false;
        state.countriesLoading = false;
        state.clubsError = action.payload || 'Failed to load clubs';
        state.countriesError = action.payload || 'Failed to load countries';
      });
  },
});

export const { updateFilters, clearError } = dashboardSlice.actions;

// Selector to get processed filters with calculated date ranges
export const selectProcessedFilters = (state) => {
  const { filters } = state.dashboard;
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  return {
    ...filters,
    calculatedStartDate: startDate,
    calculatedEndDate: endDate,
  };
};

export default dashboardSlice.reducer;