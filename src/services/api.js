import { config } from '../config/env.js';

export const fetchDashboardData = async (filters) => {
  // Build query parameters from filters
  const buildQueryString = (paramsObj) => {
    const esc = encodeURIComponent;
    return Object.entries(paramsObj)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${esc(key)}=${esc(v)}`);
        } else if (value !== undefined && value !== null && value !== 'all') {
          return `${esc(key)}=${esc(value)}`;
        } else {
          return [];
        }
      })
      .join('&');
  };

  // Convert filters to API query parameters
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
  if (filters.customStartDate && filters.customEndDate && filters.dateRange !== 'all') {
    apiParams.created_at_min = filters.customStartDate;
    apiParams.created_at_max = filters.customEndDate;
  }

  const queryString = buildQueryString(apiParams);
  const url = `${config.api.baseUrl}/opportunity_dash/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
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
  // Helper to build query string from params object
  const buildQueryString = (paramsObj) => {
    const esc = encodeURIComponent;
    return Object.entries(paramsObj)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${esc(key)}=${esc(v)}`);
        } else if (value !== undefined && value !== null) {
          return `${esc(key)}=${esc(value)}`;
        } else {
          return [];
        }
      })
      .join('&');
  };

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
    country: opp.contact?.country ? (countryMap[opp.contact.country] || opp.contact.country) : '-',
    location: opp.pipeline?.location || opp.contact?.location_id || '-',
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

export const generateDashboardData = async (filters) => {
  const apiResponse = await fetchDashboardData(filters);
  
  // Debug: Log the API response to see what we're getting

  const sm = apiResponse.sales_metrics || {};
  const totalLeads = sm.total_leads ?? null;
  const totalAppointments = sm.total_appointments ?? null;
  const totalCount = sm.total_count ?? null;
  const totalNJMs = sm.total_njms ?? null;
  // Extract online and offline from online_v_offline if present
  const online = sm.online_v_offline?.online ?? null;
  const offline = sm.online_v_offline?.offline ?? null;
  const totalNoLeadSource = sm.total_no_lead_source ?? null;
  const salesMetrics = {
    totalLeads,
    totalAppointments,
    totalNJMs,
    membershipAgreements: totalCount,
    online,
    offline,
    totalNoLeadSource,
    leadToSaleRatio: (totalLeads && totalNJMs) ? Number(((totalNJMs / totalLeads) * 100).toFixed(2)) : null,
    leadToAppointmentRatio: (totalLeads && totalAppointments) ? Number(((totalAppointments / totalLeads) * 100).toFixed(2)) : null,
    appointmentToSaleRatio: (totalAppointments && totalNJMs) ? Number(((totalAppointments / totalNJMs) * 100).toFixed(2)) : null,
    leadSourceBreakdown: sm.leadSourceBreakdown ?? [],
    leadSourceSaleBreakdown: apiResponse.leadSourceSaleBreakdown ?? [],
    appointmentStatus: apiResponse.appointment_stats ?? [],
    trend: apiResponse.trend ?? { daily: [], weekly: [], monthly: [] },
  };

  // Calculate trend sums
  const trendSums = sumTrend(salesMetrics.trend);

  const om = apiResponse.member_onboarding_metrics || {};
  const onboardingMetrics = {
    assessmentUptake: om.assessment_uptake ?? null,
    afResults: om.af_results ?? null,
    conversionRate: om.conversion_rate ?? null,
    appAdoptionRate: om.app_adoption_rate ?? null,
  };

  const dm = apiResponse.defaulter_metrics || {};
  const defaulterMetrics = {
    totalDefaulters: dm.d1 ?? null,
    totalDefaulters2Month: dm.d2 ?? null,
    totalDefaulters3Month: dm.d3 ?? null,
    communicationsSent: dm.communication_sent ?? null,
    ptpConversion: dm.ptp_conversion ?? null,
    paymentRecoveryRate: dm.payment_recovery ?? null,
    paid: dm.paid ?? null,
    totalPTP: dm.ptp ?? null,
    noResponse: dm.no_res ?? null,
    cancelledMembership: dm.cancelled_member ?? null,
  };

  // Extract valid_lead_sources from API response (if present)
  const validLeadSources = Array.isArray(apiResponse.valid_lead_sources)
    ? apiResponse.valid_lead_sources.map(src => src.value)
    : [];

  // Extract locations from API response (if present)
  const locations = Array.isArray(apiResponse.locations)
    ? apiResponse.locations
    : [];

  // Clubs: fetch separately if needed
  const clubs = [];

  return {
    salesMetrics,
    onboardingMetrics,
    defaulterMetrics,
    clubs,
    trendSums, // Add this line
    validLeadSources, // Add this line
    locations, // Add this line
  };
};

/**
 * Export opportunities as CSV from the API with query parameters.
 * @param {Object} params - Query parameters as key-value pairs. Arrays will be repeated as multiple params.
 * @returns {Promise<{blob: Blob, filename: string}>} - The CSV blob and filename (if available)
 */
export const exportOpportunitiesCsv = async (params = {}) => {
  const buildQueryString = (paramsObj) => {
    const esc = encodeURIComponent;
    return Object.entries(paramsObj)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${esc(key)}=${esc(v)}`);
        } else if (value !== undefined && value !== null) {
          return `${esc(key)}=${esc(value)}`;
        } else {
          return [];
        }
      })
      .join('&');
  };

  const queryString = buildQueryString(params);
  const url = `${config.api.baseUrl}/opportunities/export-csv/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export opportunities CSV');
  }

  const blob = await response.blob();
  // Try to extract filename from Content-Disposition header
  let filename = 'opportunities.csv';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }
  return { blob, filename };
};