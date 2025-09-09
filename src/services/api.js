import { config } from '../config/env.js';
import { calculateDateRangeParams } from '../store/slices/dashboardSlice.js';
import { store } from '../store';

// Utility function to build query string from params object
// Arrays will be joined with commas instead of creating multiple parameters
const buildQueryString = (paramsObj) => {
  const esc = encodeURIComponent;
  return Object.entries(paramsObj)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        // Join array values with commas instead of creating multiple parameters
        return `${esc(key)}=${esc(value.join(','))}`;
      } else if (value !== undefined && value !== null) {
        return `${esc(key)}=${esc(value)}`;
      } else {
        return [];
      }
    })
    .join('&');
};

// Utility function to transform lead source breakdown data
const transformLeadSourceBreakdown = (breakdownData) => {
  if (!breakdownData || typeof breakdownData !== 'object') {
    return [];
  }

  // Convert object to array and calculate total
  const entries = Object.entries(breakdownData);
  const total = entries.reduce((sum, [, value]) => sum + (value || 0), 0);

  // Transform to chart format
  return entries
    .map(([name, value]) => ({
      name,
      value: value || 0,
      percentage: total > 0 ? Number(((value || 0) / total * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
};

// Helper function to convert pipeline categories to actual pipeline names
const convertPipelineCategoriesToNames = (pipelineCategories) => {
  if (!Array.isArray(pipelineCategories) || pipelineCategories.includes('all')) {
    return null;
  }
  
  const { pipelines } = store.getState().dashboard;
  const pipelineNames = [];
  
  pipelineCategories.forEach(category => {
    const categoryData = pipelines[category];
    if (categoryData && Array.isArray(categoryData)) {
      pipelineNames.push(...categoryData);
    }
  });
  
  return pipelineNames.length > 0 ? pipelineNames : null;
};



export const fetchUsers = async () => {
  try {
    const response = await fetch(`${config.api.baseUrl}/ghlusers/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch opportunities from the API with query parameters.
 * @param {Object} params - Query parameters as key-value pairs. Arrays will be repeated as multiple params.
 * @returns {Promise<Object>} - The response JSON from the API.
 */
export const fetchOpportunities = async (params = {}) => {
  const queryString = buildQueryString(params);
  const url = `${config.api.baseUrl}/opportunities/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }

  return response.json();
};

/**
 * Normalize the API response for opportunities to a flat, UI-friendly schema.
 * @param {Object} apiResponse - The raw API response (with .results array)
 * @param {Array} countries - Array of country objects with id and name properties
 * @returns {Array} - Array of normalized opportunity objects
 */
export function normalizeOpportunitiesResponse(apiResponse, countries = []) {
  if (!apiResponse || !Array.isArray(apiResponse.results)) return [];
  
  // Create a map for quick country ID to name lookup
  const countryMap = {};
  countries.forEach(country => {
    countryMap[country.id] = country.name;
  });
  return apiResponse.results.map((opp) => ({
    id: opp.ghl_id || opp.id,
    name: opp.name || '',
    value: typeof opp.opp_value === 'string' ? parseFloat(opp.opp_value) : (opp.opp_value ?? 0),
    assignedTo: opp.assigned_to || '-',
    pipeline: opp.pipeline?.name || '-',
    contact: opp.contact
      ? `${opp.contact.first_name || ''} ${opp.contact.last_name || ''}`.trim() || opp.contact.email || '-'
      : '-',
    contactEmail: opp.contact?.email || '-',
    contactPhone: opp.contact?.phone || '-',
    country: opp.location?.country_display || '-',
    location: opp.pipeline?.location || opp.location?.id || '-',
    location_name: opp.location?.name || '-',
    stage: opp.stage?.name || '-',
    status: opp.status_display || '-',
    createdDate: opp.created_at ? new Date(opp.created_at).toLocaleDateString() : '-',
    lastActivity: opp.updated_at ? new Date(opp.updated_at).toLocaleDateString() : '-',
    source: opp.contact?.custom_fields?.lead_source || '-',
    raw: opp, // keep original for debugging if needed
  }));
}

/**
 * Calculate the sum of leads, appointments, and njms for each period in the trend object.
 * @param {Object} trend - The trend object with daily, weekly, and monthly arrays.
 * @returns {Object} - An object with sums for each period: { daily: {leads, appointments, njms}, weekly: {...}, monthly: {...} }
 */
export function sumTrend(trend) {
  // Helper to sum an array of objects for given keys
  const sumArray = (arr = []) => {
    return arr.reduce(
      (acc, curr) => {
        acc.leads += curr.leads || 0;
        acc.appointments += curr.appointments || 0;
        acc.njms += curr.njms || 0;
        return acc;
      },
      { leads: 0, appointments: 0, njms: 0 }
    );
  };

  return {
    daily: sumArray(trend.daily),
    weekly: sumArray(trend.weekly),
    monthly: sumArray(trend.monthly),
  };
}

/**
 * Fetch both clubs and unique countries from the locations API in a single call.
 * @returns {Promise<{ clubs: Array, countries: Array }>} - Object with clubs and countries arrays
 */
export const fetchClubsAndCountries = async () => {
  const response = await fetch(`${config.api.baseUrl}/locations/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch locations for clubs and countries');
  }

  const data = await response.json();
  // Clubs: { id, name, countryDisplay }
  const clubs = Array.isArray(data)
    ? data.map(loc => ({
        id: loc.id,
        name: loc.name,
        countryDisplay: loc.country_display,
      }))
    : [];
  // Countries: unique { id, name }
  const countryMap = {};
  if (Array.isArray(data)) {
    data.forEach(loc => {
      if (loc.country && loc.country_display) {
        countryMap[loc.country] = loc.country_display;
      }
    });
  }
  const countries = Object.entries(countryMap).map(([id, name]) => ({ id, name }));
  return { clubs, countries };
};

export const generateDashboardData = async (filters, activeSection = 0) => {
  console.log('🚀 generateDashboardData called with:', { filters, activeSection });
  
  // Validate filters before making API calls
  const validatedFilters = {
    country: Array.isArray(filters.country) ? filters.country : ['all'],
    club: Array.isArray(filters.club) ? filters.club : ['all'],
    assignedUser: Array.isArray(filters.assignedUser) ? filters.assignedUser : ['all'],
    dateRange: filters.dateRange || 'last-30-days',
    leadSource: Array.isArray(filters.leadSource) ? filters.leadSource : ['all'],
    pipeline: Array.isArray(filters.pipeline) ? filters.pipeline : ['all'],
    customStartDate: filters.customStartDate || null,
    customEndDate: filters.customEndDate || null,
  };

  console.log('✅ Validated filters:', validatedFilters);
  
  // Define which APIs to call based on active section
  // 0: Sales Pipeline, 1: Member Onboarding, 2: Defaulter Management, 3: Regional View
  const apiCalls = [];
  
  // Always fetch valid lead sources
  apiCalls.push(fetchValidLeadSources(validatedFilters));
  
  // Sales Pipeline (section 0) - needs all sales-related APIs
  if (activeSection === 0) {
    apiCalls.push(
      fetchSalesMetrics(validatedFilters),
      fetchTrendData(validatedFilters),
      fetchAppointmentStats(validatedFilters),
      fetchBreakdownData(validatedFilters)
    );
  }
  
  // Member Onboarding (section 1) - needs onboarding metrics
  if (activeSection === 1) {
    apiCalls.push(fetchMemberOnboardingMetrics(validatedFilters));
  }
  
  // Defaulter Management (section 2) - needs defaulter metrics
  if (activeSection === 2) {
    apiCalls.push(fetchDefaulterMetrics(validatedFilters));
  }
  
  // Regional View (section 3) - needs location stats
  if (activeSection === 3) {
    apiCalls.push(fetchLocationStats(validatedFilters));
  }
  
  try {
    // Execute the API calls
    console.log(`📡 Making ${apiCalls.length} API calls for section ${activeSection}`);
    const responses = await Promise.all(apiCalls);
    console.log('✅ All API calls completed successfully');
    
    // Extract responses based on what was called
    let validLeadSourcesResponse = responses[0]; // fetchValidLeadSources is always first
    let memberOnboardingResponse = null;
    let defaulterResponse = null;
    let locationStatsResponse = null;
    let salesMetricsResponse = null;
    let trendDataResponse = null;
    let appointmentStatsResponse = null;
    let breakdownDataResponse = null;
    
    let responseIndex = 1; // Start after fetchValidLeadSources
    
    if (activeSection === 0) {
      salesMetricsResponse = responses[responseIndex++];
      trendDataResponse = responses[responseIndex++];
      appointmentStatsResponse = responses[responseIndex++];
      breakdownDataResponse = responses[responseIndex++];
    } else if (activeSection === 1) {
      memberOnboardingResponse = responses[responseIndex++];
    } else if (activeSection === 2) {
      defaulterResponse = responses[responseIndex++];
    } else if (activeSection === 3) {
      locationStatsResponse = responses[responseIndex++];
    }
    
    console.log('📊 API Responses:', {
      salesMetrics: salesMetricsResponse,
      trendData: trendDataResponse,
      appointmentStats: appointmentStatsResponse,
      breakdownData: breakdownDataResponse,
      memberOnboarding: memberOnboardingResponse,
      defaulter: defaulterResponse,
      locationStats: locationStatsResponse
    });
    
    // Debug: Log the API response to see what we're getting
    const appointment_showed = appointmentStatsResponse?.opportunities_with_shown_appointments ?? 0;
    // Use the dedicated sales metrics endpoint response
    const totalLeads = salesMetricsResponse?.total_leads ?? null;
    // Use appointment stats for total appointments
    const totalAppointments = appointmentStatsResponse?.total_appointments ?? null;
    const totalCount = salesMetricsResponse?.total_count ?? null;
    const totalNJMs = salesMetricsResponse?.total_njms ?? null;
    // Extract NJM with shown appointments from appointment stats
    const totalNJMWithShownAppointments = appointmentStatsResponse?.total_njm_with_shown_appointments ?? 0;
    // Extract online and offline from breakdown data
    const online = salesMetricsResponse?.online_v_offline?.online ?? null;
    const offline = salesMetricsResponse?.online_v_offline?.offline ?? null;
    const totalNoLeadSource = salesMetricsResponse?.total_no_lead_source ?? null;
    const totalContacted = salesMetricsResponse?.total_contacted ?? null;
    const totalPaidMedia = salesMetricsResponse?.total_paid_media ?? null;
    // Extract NJM online/offline breakdown
    const njmOnline = salesMetricsResponse?.njm_online_v_offline?.online ?? null;
    const njmOffline = salesMetricsResponse?.njm_online_v_offline?.offline ?? null;
    const salesMetrics = {
      totalLeads,
      totalAppointments,
      totalNJMs,
      totalNJMWithShownAppointments,
      membershipAgreements: totalCount,
      online,
      offline,
      appointment_showed,
      totalNoLeadSource,
      totalContacted,
      totalPaidMedia,
      njm_online_v_offline: {
        online: njmOnline,
        offline: njmOffline,
      },
      leadToSaleRatio: (totalLeads && totalNJMs) ? Number(((totalNJMs / totalLeads) * 100).toFixed(2)) : 0,
      leadToAppointmentRatio: (totalLeads && totalAppointments) ? Number(((totalAppointments / totalLeads) * 100).toFixed(2)) : 0,
      appointmentToSaleRatio: (totalAppointments && totalNJMs) ? Number(((totalAppointments / totalNJMs) * 100).toFixed(2)) : 0,
      contactedToAppointmentRatio: (totalContacted && totalAppointments) ? Number(((totalContacted / totalAppointments) * 100).toFixed(2)) : 0,
      leadSourceBreakdown: transformLeadSourceBreakdown(breakdownDataResponse?.leadSourceBreakdown),
      leadSourceSaleBreakdown: transformLeadSourceBreakdown(breakdownDataResponse?.leadSourceSaleBreakdown),
      appointmentStatus: appointmentStatsResponse?.appointment_stats ?? [],
      trend: trendDataResponse ?? { daily: [], weekly: [], monthly: [] },
    };

    // Calculate trend sums
    const trendSums = sumTrend(salesMetrics.trend);

    // Use the dedicated member onboarding metrics endpoint response
    const onboardingMetrics = {
      assessmentUptake: memberOnboardingResponse?.assessment_uptake ?? null,
      afResults: memberOnboardingResponse?.af_results ?? null,
      conversionRate: memberOnboardingResponse?.conversion_rate ?? null,
      appAdoptionRate: memberOnboardingResponse?.app_adoption_rate ?? null,
    };

    // Use the dedicated defaulter metrics endpoint response
    const defaulterMetrics = {
      totalDefaulters: defaulterResponse?.d1 ?? null,
      totalDefaulters2Month: defaulterResponse?.d2 ?? null,
      totalDefaulters3Month: defaulterResponse?.d3 ?? null,
      communicationsSent: defaulterResponse?.communication_sent ?? null,
      ptpConversion: defaulterResponse?.ptp_conversion ?? null,
      paymentRecoveryRate: defaulterResponse?.payment_recovery ?? null,
      paid: defaulterResponse?.paid ?? null,
      totalPTP: defaulterResponse?.ptp ?? null,
      noResponse: defaulterResponse?.no_res ?? null,
      cancelledMembership: defaulterResponse?.cancelled_member ?? null,
    };

    // Extract valid_lead_sources from API response (if present)
    const validLeadSources = validLeadSourcesResponse && typeof validLeadSourcesResponse === 'object'
      ? Object.entries(validLeadSourcesResponse).map(([key, value]) => ({ value: value, label: key }))
      : [];

    // Use the dedicated location stats endpoint response
    const locations = Array.isArray(locationStatsResponse)
      ? locationStatsResponse
      : [];

    // Clubs: fetch separately if needed
    const clubs = [];

    const result = {
      salesMetrics,
      onboardingMetrics,
      defaulterMetrics,
      clubs,
      trendSums, // Add this line
      validLeadSources, // Add this line
      locations, // Add this line
    };

    console.log('🎯 Final processed data:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error in generateDashboardData:', error);
    throw error;
  }
};

export const fetchMemberOnboardingMetrics = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/member-onboarding-metrics/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch member onboarding metrics');
  }

  return response.json();
};

export const fetchDefaulterMetrics = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/defaulter-metrics/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch defaulter metrics');
  }

  return response.json();
};

export const fetchLocationStats = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/location-stats/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch location stats');
  }

  return response.json();
};

export const fetchLocationWiseData = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/location-vise/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch location-wise data');
  }

  return response.json();
};

export const fetchSalesMetrics = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/sales-metrics/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sales metrics');
  }

  return response.json();
};

export const fetchTrendData = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/trend-data/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trend data');
  }

  return response.json();
};

export const fetchAppointmentStats = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/appointment-stats/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointment stats');
  }

  return response.json();
};

export const fetchBreakdownData = async (filters) => {
  // Build query parameters from filters
  const apiParams = {};
  
  if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
    apiParams.assigned_to = filters.assignedUser;
  }
  if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
    apiParams.country = filters.country;
  }
  if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
    apiParams.location = filters.club;
  }
  if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
    apiParams.lead_source = filters.leadSource;
  }
  // Handle date range filters using centralized logic
  const { startDate, endDate } = calculateDateRangeParams(
    filters.dateRange, 
    filters.customStartDate, 
    filters.customEndDate
  );
  
  if (startDate && endDate) {
    apiParams.raw_created_at_min = startDate;
    apiParams.raw_created_at_max = endDate;
  }
  
  // Add pipeline name parameter if pipeline filter is specified
  if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
    const pipelineNames = convertPipelineCategoriesToNames(filters.pipeline);
    if (pipelineNames) {
      apiParams.pipeline_name = pipelineNames;
    }
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/breakdown-data/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch breakdown data');
  }

  return response.json();
};

/**
 * Fetch valid lead sources from the API
 * @param {Object} filters - Optional filters for date range
 * @returns {Promise<Array>} - Array of lead source objects with value and label properties
 */
export const fetchValidLeadSources = async (filters = {}) => {
  try {
    // Build query parameters for date range if provided
    const apiParams = {};
    
    // Handle date range filters using centralized logic
    const { startDate, endDate } = calculateDateRangeParams(
      filters.dateRange, 
      filters.customStartDate, 
      filters.customEndDate
    );
    
    if (startDate && endDate) {
      apiParams.raw_created_at_min = startDate;
      apiParams.raw_created_at_max = endDate;
    }

    const queryString = buildQueryString(apiParams);
    // Use the correct API base URL from the user's request
    const baseUrl = 'https://reports.anytimefitnesscorporate.com/api';
    const url = `${baseUrl}/opportunity_dash/valid-lead-source/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch valid lead sources: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // Case 1: API returns {"lead_sources": ["source1", "source2", ...]}
      if (data.lead_sources && Array.isArray(data.lead_sources)) {
        const leadSources = data.lead_sources
          .filter(source => source !== null && source !== undefined) // Filter out null/undefined values
          .map(source => {
            // Handle case where source might be an array (like ["SMS"])
            return Array.isArray(source) ? source[0] : source;
          })
          .filter(source => source && source.trim() !== ''); // Filter out empty values
        
        return leadSources;
      }
      
      // Case 2: API returns {"0102298829":"","1 Day Trial":"daytrial",...} (original expected format)
      const leadSources = Object.entries(data)
        .map(([label, value]) => value || label)
        .filter(source => source && source.trim() !== '');
      
      return leadSources;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching valid lead sources:', error);
    throw error;
  }
};

/**
 * Export opportunities as CSV from the API with query parameters.
 * @param {Object} params - Query parameters as key-value pairs. Arrays will be repeated as multiple params.
 * @returns {Promise<{blob: Blob, filename: string}>} - The CSV blob and filename (if available)
 */
export const exportOpportunitiesCsv = async (params = {}) => {
  const queryString = buildQueryString(params);
  const generateUrl = `${config.api.baseUrl}/opportunities/generate_csv/${queryString ? `?${queryString}` : ''}`;

  // Step 1: Generate CSV file (using backend as proxy)
  const generateResponse = await fetch(generateUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!generateResponse.ok) {
    throw new Error('Failed to generate opportunities CSV');
  }

  const generateData = await generateResponse.json();
  const { file_url, time_taken_seconds } = generateData;

  if (!file_url) {
    throw new Error('No file URL received from CSV generation');
  }

  // Step 2: Trigger browser download instead of fetching the file
  // This avoids CORS issues by letting the browser handle the download
  console.log('File URL:', file_url);
  
  // Extract filename from the file URL
  let filename = 'opportunities.csv';
  try {
    const urlParts = file_url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.includes('.csv')) {
      filename = lastPart;
    }
  } catch (error) {
    console.warn('Could not extract filename from URL, using default');
  }

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = file_url;
  link.download = filename;
  link.target = '_blank'; // Open in new tab as fallback
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { file_url, filename, time_taken_seconds };
};

// Alternative function for direct external API calls (if needed)
export const exportOpportunitiesCsvDirect = async (params = {}) => {
  const queryString = buildQueryString(params);
  const generateUrl = `https://reports.anytimefitnesscorporate.com/api/opportunities/generate_csv/${queryString ? `?${queryString}` : ''}`;

  // Step 1: Generate CSV file
  const generateResponse = await fetch(generateUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!generateResponse.ok) {
    throw new Error('Failed to generate opportunities CSV');
  }

  const generateData = await generateResponse.json();
  const { file_url, time_taken_seconds } = generateData;

  if (!file_url) {
    throw new Error('No file URL received from CSV generation');
  }

  // Step 2: Trigger browser download instead of fetching the file
  // This avoids CORS issues by letting the browser handle the download
  const link = document.createElement('a');
  link.href = file_url;
  link.download = file_url.split('/').pop() || 'opportunities.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { file_url, time_taken_seconds };
};

// Function to fetch pipeline names
export const fetchPipelineNames = async () => {
  try {
    // Use the new API endpoint as specified by the user
    const response = await fetch('https://reports.anytimefitnesscorporate.com/api/pipelines/names/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pipeline names: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the new response format
    // The API returns an object with pipeline categories as keys and arrays of pipeline names as values
    if (data && typeof data === 'object') {
      // Return the entire data object so we can access both keys and values
      return data;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching pipeline names:', error);
    throw error;
  }
};

// Function to fetch pipeline stages (if needed in the future)
export const fetchPipelineStages = async () => {
  try {
    const response = await fetch('https://reports.anytimefitnesscorporate.com/api/pipelines/names/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pipeline stages: ${response.status}`);
    }

    const data = await response.json();
    
    // Return stages if available
    if (data && data.stages && Array.isArray(data.stages)) {
      return data.stages.sort();
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    throw error;
  }
};