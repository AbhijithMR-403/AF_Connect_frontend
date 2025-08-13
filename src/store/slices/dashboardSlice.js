import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardData, generateDashboardData, fetchUsers, fetchClubsAndCountries, fetchMemberOnboardingMetrics, fetchDefaulterMetrics, fetchLocationStats, fetchSalesMetrics, fetchTrendData, fetchAppointmentStats, fetchBreakdownData, fetchValidLeadSources } from '../../services/api';

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
    usePipelineFilter: false,
  },
  activeSection: 0, // 0: Sales Pipeline, 1: Member Onboarding, 2: Defaulter Management, 3: Regional View
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
  validLeadSourcesLoading: false,
  validLeadSourcesError: null,
  locations: [], // Add this line
  isInitialized: false, // Flag to prevent duplicate initial API calls
};

// Async thunk for fetching dashboard data
export const loadDashboardData = createAsyncThunk(
  'dashboard/loadData',
  async ({ filters, activeSection }, { rejectWithValue, getState }) => {
    try {
      // Get active section from state if not provided
      const section = activeSection ?? getState().dashboard.activeSection;
      // Always use the mapping function
      return await generateDashboardData(filters, section);
    } catch (error) {
      console.warn('API failed, using dummy data:', error);
      // Fallback to dummy data if API fails
      const section = activeSection ?? getState().dashboard.activeSection;
      return generateDashboardData(filters, section);
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

// Async thunk for fetching member onboarding metrics separately
export const loadMemberOnboardingMetrics = createAsyncThunk(
  'dashboard/loadMemberOnboardingMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchMemberOnboardingMetrics(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching defaulter metrics separately
export const loadDefaulterMetrics = createAsyncThunk(
  'dashboard/loadDefaulterMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchDefaulterMetrics(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching location stats separately
export const loadLocationStats = createAsyncThunk(
  'dashboard/loadLocationStats',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchLocationStats(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching sales metrics separately
export const loadSalesMetrics = createAsyncThunk(
  'dashboard/loadSalesMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchSalesMetrics(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching trend data separately
export const loadTrendData = createAsyncThunk(
  'dashboard/loadTrendData',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchTrendData(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching appointment stats separately
export const loadAppointmentStats = createAsyncThunk(
  'dashboard/loadAppointmentStats',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchAppointmentStats(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching breakdown data separately
export const loadBreakdownData = createAsyncThunk(
  'dashboard/loadBreakdownData',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await fetchBreakdownData(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching valid lead sources
export const loadValidLeadSources = createAsyncThunk(
  'dashboard/loadValidLeadSources',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchValidLeadSources();
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
    updateActiveSection: (state, action) => {
      state.activeSection = action.payload;
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
        // Don't overwrite validLeadSources here as they are loaded separately
        state.locations = action.payload.locations || [];
        state.isInitialized = true; // Mark as initialized after first successful load
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
      })
      .addCase(loadMemberOnboardingMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMemberOnboardingMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardingMetrics = {
          assessmentUptake: action.payload.assessment_uptake ?? null,
          afResults: action.payload.af_results ?? null,
          conversionRate: action.payload.conversion_rate ?? null,
          appAdoptionRate: action.payload.app_adoption_rate ?? null,
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadMemberOnboardingMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load member onboarding metrics';
      })
      .addCase(loadDefaulterMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDefaulterMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.defaulterMetrics = {
          totalDefaulters: action.payload.d1 ?? null,
          totalDefaulters2Month: action.payload.d2 ?? null,
          totalDefaulters3Month: action.payload.d3 ?? null,
          communicationsSent: action.payload.communication_sent ?? null,
          ptpConversion: action.payload.ptp_conversion ?? null,
          paymentRecoveryRate: action.payload.payment_recovery ?? null,
          paid: action.payload.paid ?? null,
          totalPTP: action.payload.ptp ?? null,
          noResponse: action.payload.no_res ?? null,
          cancelledMembership: action.payload.cancelled_member ?? null,
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadDefaulterMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load defaulter metrics';
      })
      .addCase(loadLocationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLocationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadLocationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load location stats';
      })
      .addCase(loadSalesMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSalesMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.salesMetrics = {
          totalLeads: action.payload.total_leads ?? null,
          totalAppointments: action.payload.total_appointments ?? null,
          totalNJMs: action.payload.total_njms ?? null,
          membershipAgreements: action.payload.total_count ?? null,
          online: action.payload.online_v_offline?.online ?? null,
          offline: action.payload.online_v_offline?.offline ?? null,
          appointment_showed: action.payload.appointment_showed ?? 0,
          totalNoLeadSource: action.payload.total_no_lead_source ?? null,
          totalContacted: action.payload.total_contacted ?? null,
          totalPaidMedia: action.payload.total_paid_media ?? null,
          leadToSaleRatio: (action.payload.total_leads && action.payload.total_njms) ? Number(((action.payload.total_njms / action.payload.total_leads) * 100).toFixed(2)) : null,
          leadToAppointmentRatio: (action.payload.total_leads && action.payload.total_appointments) ? Number(((action.payload.total_appointments / action.payload.total_leads) * 100).toFixed(2)) : 0,
          appointmentToSaleRatio: (action.payload.total_appointments && action.payload.total_njms) ? Number(((action.payload.total_appointments / action.payload.total_njms) * 100).toFixed(2)) : 0,
          leadSourceBreakdown: action.payload.leadSourceBreakdown ?? [],
          leadSourceSaleBreakdown: action.payload.leadSourceSaleBreakdown ?? [],
          appointmentStatus: action.payload.appointment_stats ?? [],
          trend: action.payload.trend ?? { daily: [], weekly: [], monthly: [] },
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadSalesMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load sales metrics';
      })
      .addCase(loadTrendData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTrendData.fulfilled, (state, action) => {
        state.loading = false;
        // Update trend data in sales metrics
        if (state.salesMetrics) {
          state.salesMetrics.trend = action.payload ?? { daily: [], weekly: [], monthly: [] };
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadTrendData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load trend data';
      })
      .addCase(loadAppointmentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAppointmentStats.fulfilled, (state, action) => {
        state.loading = false;
        // Update appointment stats in sales metrics
        if (state.salesMetrics) {
          state.salesMetrics.totalAppointments = action.payload.total_appointments ?? null;
          state.salesMetrics.appointment_showed = action.payload.opportunities_with_shown_appointments ?? 0;
          state.salesMetrics.appointmentStatus = action.payload.appointment_stats ?? [];
          // Recalculate ratios with new appointment data
          if (state.salesMetrics.totalLeads && action.payload.total_appointments) {
            state.salesMetrics.leadToAppointmentRatio = Number(((action.payload.total_appointments / state.salesMetrics.totalLeads) * 100).toFixed(2));
          }
          if (action.payload.total_appointments && state.salesMetrics.totalNJMs) {
            state.salesMetrics.appointmentToSaleRatio = Number(((action.payload.total_appointments / state.salesMetrics.totalNJMs) * 100).toFixed(2));
          }
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadAppointmentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load appointment stats';
      })
      .addCase(loadBreakdownData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBreakdownData.fulfilled, (state, action) => {
        state.loading = false;
        // Update breakdown data in sales metrics
        if (state.salesMetrics) {
          state.salesMetrics.online = action.payload.online_v_offline?.online ?? null;
          state.salesMetrics.offline = action.payload.online_v_offline?.offline ?? null;
          state.salesMetrics.totalNoLeadSource = action.payload.total_no_oppo_source ?? null;
          state.salesMetrics.leadSourceBreakdown = action.payload.leadSourceBreakdown ?? [];
          state.salesMetrics.leadSourceSaleBreakdown = action.payload.leadSourceSaleBreakdown ?? [];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadBreakdownData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load breakdown data';
      })
             .addCase(loadValidLeadSources.pending, (state) => {
         state.validLeadSourcesLoading = true;
         state.validLeadSourcesError = null;
       })
       .addCase(loadValidLeadSources.fulfilled, (state, action) => {
         state.validLeadSourcesLoading = false;
         state.validLeadSources = action.payload;
       })
       .addCase(loadValidLeadSources.rejected, (state, action) => {
         state.validLeadSourcesLoading = false;
         state.validLeadSourcesError = action.error.message || 'Failed to load valid lead sources';
       });
  },
});

export const { updateFilters, updateActiveSection, clearError } = dashboardSlice.actions;

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