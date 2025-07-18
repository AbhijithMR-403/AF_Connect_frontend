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
    status: opp.status || '-',
    createdDate: opp.created_at ? new Date(opp.created_at).toLocaleDateString() : '-',
    lastActivity: opp.updated_at ? new Date(opp.updated_at).toLocaleDateString() : '-',
    source: opp.contact?.custom_fields?.lead_source || '-',
    raw: opp, // keep original for debugging if needed
  }));
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
  console.log('generateDashboardData called with filters:', filters);
  const apiResponse = await fetchDashboardData(filters);
  
  // Debug: Log the API response to see what we're getting
  console.log('API Response from /opportunity_dash/:', apiResponse);

  // Dummy values for fallback
  const dummySalesMetrics = {
    totalLeads: 1045,
    totalAppointments: 708,
    totalNJMs: 409,
    membershipAgreements: 377,
    leadToSaleRatio: 39.1,
    leadToAppointmentRatio: 67.8,
    appointmentToSaleRatio: 57.8,
    leadSourceBreakdown: [
      { name: 'Facebook', value: 1250, percentage: 20, color: '#3B82F6' },
      { name: 'Instagram', value: 890, percentage: 14, color: '#EC4899' },
      { name: 'Tiktok', value: 600, percentage: 10, color: '#111827' },
      { name: 'Whatsapp', value: 500, percentage: 8, color: '#25D366' },
      { name: 'Google', value: 675, percentage: 11, color: '#10B981' },
      { name: 'Email', value: 400, percentage: 6, color: '#6366F1' },
      { name: 'SMS', value: 350, percentage: 5, color: '#F472B6' },
      { name: 'Walk-in', value: 300, percentage: 4, color: '#F59E42' },
      { name: 'Outreach', value: 445, percentage: 7, color: '#8B5CF6' },
      { name: 'Referral', value: 301, percentage: 4, color: '#F59E0B' },
      { name: 'POS Referral', value: 200, percentage: 3, color: '#A21CAF' },
      { name: 'Corporate', value: 180, percentage: 2.5, color: '#0EA5E9' },
      { name: 'Existing Member', value: 160, percentage: 2, color: '#F43F5E' },
      { name: 'Ex-member', value: 120, percentage: 1.5, color: '#FBBF24' },
      { name: 'Bulk Import', value: 100, percentage: 1, color: '#14B8A6' },
      { name: 'Flyers', value: 80, percentage: 0.8, color: '#F87171' },
      { name: 'Website', value: 60, percentage: 0.5, color: '#0D9488' },
      { name: 'Retail Partner', value: 40, percentage: 0.2, color: '#7C3AED' },
    ],
    appointmentStatus: [
      { status: 'Show', count: 1456, percentage: 65, color: '#10B981' },
      { status: 'No Show', count: 534, percentage: 24, color: '#EF4444' },
      { status: 'Cancelled', count: 156, percentage: 7, color: '#F59E0B' },
      { status: 'Rescheduled', count: 89, percentage: 4, color: '#3B82F6' },
    ],
  };

  const dummyOnboardingMetrics = {
    assessmentUptake: 85.4,
    afResults: 72.1,
    conversionRate: 84.5,
    appAdoptionRate: 68.9,
  };

  const dummyDefaulterMetrics = {
    totalDefaulters: 89,
    totalDefaulters2Month: 45,
    totalDefaulters3Month: 22,
    communicationsSent: 234,
    ptpConversion: 67.8,
    paymentRecoveryRate: 45.2,
    paid: 30,
    totalPTP: 50,
    noResponse: 15,
    cancelledMembership: 8,
  };

  // Dummy trend data for fallback
  const dummyTrend = {
    daily: [
      { period: 'Sat', leads: 3, appointments: 1, njms: 1 },
      { period: 'Sun', leads: 11, appointments: 1, njms: 1 },
      { period: 'Mon', leads: 1, appointments: 5, njms: 2 },
      { period: 'Tue', leads: 9, appointments: 5, njms: 1 },
      { period: 'Wed', leads: 31, appointments: 8, njms: 1 },
    ],
    weekly: [
      { period: 'W1', leads: 1, appointments: 0, njms: 2 },
      { period: 'W2', leads: 2, appointments: 0, njms: 8 },
      { period: 'W3', leads: 0, appointments: 0, njms: 2 },
      { period: 'W4', leads: 0, appointments: 0, njms: 10 },
      { period: 'W5', leads: 2, appointments: 0, njms: 13 },
      { period: 'W6', leads: 4, appointments: 0, njms: 16 },
      { period: 'W7', leads: 1, appointments: 0, njms: 10 },
      { period: 'W8', leads: 24, appointments: 0, njms: 9 },
      { period: 'W9', leads: 3, appointments: 0, njms: 14 },
      { period: 'W10', leads: 4, appointments: 0, njms: 7 },
      { period: 'W11', leads: 4, appointments: 0, njms: 3 },
      { period: 'W12', leads: 18, appointments: 0, njms: 9 },
      { period: 'W13', leads: 15, appointments: 0, njms: 5 },
      { period: 'W14', leads: 3, appointments: 0, njms: 5 },
      { period: 'W15', leads: 16, appointments: 1, njms: 8 },
      { period: 'W16', leads: 15, appointments: 25, njms: 10 },
      { period: 'W17', leads: 44, appointments: 17, njms: 8 },
      { period: 'W18', leads: 41, appointments: 18, njms: 4 },
    ],
    monthly: [
      { period: 'Oct', leads: 6, appointments: 0, njms: 1 },
      { period: 'Nov', leads: 2, appointments: 0, njms: 2 },
      { period: 'Dec', leads: 22, appointments: 0, njms: 0 },
      { period: 'Jan', leads: 2070, appointments: 1, njms: 758 },
      { period: 'Feb', leads: 40, appointments: 0, njms: 21 },
      { period: 'Mar', leads: 6, appointments: 0, njms: 29 },
      { period: 'Apr', leads: 7, appointments: 0, njms: 48 },
      { period: 'May', leads: 35, appointments: 0, njms: 36 },
      { period: 'Jun', leads: 55, appointments: 2, njms: 28 },
      { period: 'Jul', leads: 97, appointments: 59, njms: 21 },
    ],
  };

  const sm = apiResponse.sales_metrics || {};
  const totalLeads = sm.total_leads ?? dummySalesMetrics.totalLeads;
  const totalAppointments = sm.total_appointments ?? dummySalesMetrics.totalAppointments;
  const totalCount = sm.total_count ?? dummySalesMetrics.membershipAgreements;

  const salesMetrics = {
    totalLeads,
    totalAppointments,
    totalNJMs: sm.total_njms ?? dummySalesMetrics.totalNJMs,
    membershipAgreements: totalCount,
    leadToSaleRatio: totalLeads ? (totalCount / totalLeads) * 100 : dummySalesMetrics.leadToSaleRatio,
    leadToAppointmentRatio: totalLeads ? (totalAppointments / totalLeads) * 100 : dummySalesMetrics.leadToAppointmentRatio,
    appointmentToSaleRatio: totalAppointments ? (totalCount / totalAppointments) * 100 : dummySalesMetrics.appointmentToSaleRatio,
    leadSourceBreakdown: sm.leadSourceBreakdown ?? dummySalesMetrics.leadSourceBreakdown,
    appointmentStatus: sm.appointment_status ?? dummySalesMetrics.appointmentStatus,
    trend: apiResponse.trend ?? dummyTrend
  };

  const om = apiResponse.member_onboarding_metrics || {};
  const onboardingMetrics = {
    assessmentUptake: om.assessment_uptake ?? dummyOnboardingMetrics.assessmentUptake,
    afResults: om.af_results ?? dummyOnboardingMetrics.afResults,
    conversionRate: om.conversion_rate ?? dummyOnboardingMetrics.conversionRate,
    appAdoptionRate: om.app_adoption_rate ?? dummyOnboardingMetrics.appAdoptionRate,
  };

  const dm = apiResponse.defaulter_metrics || {};
  const defaulterMetrics = {
    totalDefaulters: dm.d1 ?? dummyDefaulterMetrics.totalDefaulters,
    totalDefaulters2Month: dm.d2 ?? dummyDefaulterMetrics.totalDefaulters2Month,
    totalDefaulters3Month: dm.d3 ?? dummyDefaulterMetrics.totalDefaulters3Month,
    communicationsSent: dm.communication_sent ?? dummyDefaulterMetrics.communicationsSent,
    ptpConversion: dm.ptp_conversion ?? dummyDefaulterMetrics.ptpConversion,
    paymentRecoveryRate: dm.payment_recovery ?? dummyDefaulterMetrics.paymentRecoveryRate,
    paid: dm.paid ?? dummyDefaulterMetrics.paid,
    totalPTP: dm.ptp ?? dummyDefaulterMetrics.totalPTP,
    noResponse: dm.no_res ?? dummyDefaulterMetrics.noResponse,
    cancelledMembership: dm.cancelled_member ?? dummyDefaulterMetrics.cancelledMembership,
  };

  // Extract trend from API response or use dummyTrend

  // Clubs: fetch separately if needed
  const clubs = [];

  return {
    salesMetrics,
    onboardingMetrics,
    defaulterMetrics,
    clubs,
  };
};