import { config } from '../config/env.js';

export const fetchDashboardData = async (filters) => {
  // Simulate API call
  const response = await fetch(`${config.api.baseUrl}/api/dashboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
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
 * @returns {Array} - Array of normalized opportunity objects
 */
export function normalizeOpportunitiesResponse(apiResponse) {
  if (!apiResponse || !Array.isArray(apiResponse.results)) return [];
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
    country: opp.contact?.country || '-',
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
 * Fetch clubs (locations) from the API and normalize to { id, name, countryDisplay }
 * @returns {Promise<Array>} - Array of club objects
 */
export const fetchClubs = async () => {
  const response = await fetch(`${config.api.baseUrl}/locations/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch clubs');
  }

  const data = await response.json();
  // Normalize to { id, name, countryDisplay }
  return Array.isArray(data)
    ? data.map(loc => ({
        id: loc.id,
        name: loc.name,
        countryDisplay: loc.country_display,
      }))
    : [];
};

/**
 * Fetch unique countries from the locations API.
 * @returns {Promise<Array>} - Array of country objects: { id, name }
 */
export const fetchCountries = async () => {
  const response = await fetch(`${config.api.baseUrl}/locations/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch locations for countries');
  }

  const data = await response.json();
  // Extract unique countries
  const countryMap = {};
  if (Array.isArray(data)) {
    data.forEach(loc => {
      if (loc.country && loc.country_display) {
        countryMap[loc.country] = loc.country_display;
      }
    });
  }
  return Object.entries(countryMap).map(([id, name]) => ({ id, name }));
};

export const generateDummyData = (filters) => {
  const salesMetrics = {
    totalLeads: 1045,
    totalAppointments: 708,
    totalNJMs: 409,
    membershipAgreements: 377,
    leadToSaleRatio: 39.1,
    leadToAppointmentRatio: 67.8,
    appointmentToSaleRatio: 57.8,
    percentageChanges: {
      leads: 12.5,
      appointments: 8.3,
      njms: 15.2,
      memberships: 18.7,
    },
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

  const onboardingMetrics = {
    assessmentUptake: 85.4,
    afResults: 72.1,
    conversionRate: 84.5,
    appAdoptionRate: 68.9,
  };

  const defaulterMetrics = {
    totalDefaulters: 89,
    totalDefaulters2Month: 45, // 2-month defaulters
    totalDefaulters3Month: 22, // 3-month defaulters
    communicationsSent: 234,
    ptpConversion: 67.8,
    paymentRecoveryRate: 45.2,
    paid: 30, // Paid
    totalPTP: 50, // Total PTP
    noResponse: 15, // No Response
    cancelledMembership: 8, // Cancelled Membership
  };

  const clubs = [
    { id: 'club-1', name: 'Manila Central', countryId: 'ph' },
    { id: 'club-2', name: 'Makati Premium', countryId: 'ph' },
    { id: 'club-3', name: 'Jakarta Elite', countryId: 'id' },
    { id: 'club-4', name: 'Kuala Lumpur City', countryId: 'my' },
    { id: 'club-5', name: 'Singapore Marina', countryId: 'sg' },
    { id: 'club-6', name: 'Bangkok Central', countryId: 'th' },
  ];

  return {
    salesMetrics,
    onboardingMetrics,
    defaulterMetrics,
    clubs,
  };
};