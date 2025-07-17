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