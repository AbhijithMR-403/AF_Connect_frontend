const generateOpportunityId = () => {
  return `OPP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const getRandomDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toLocaleDateString();
};

const getRandomLastActivity = () => {
  const activities = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago', '2 weeks ago'];
  return activities[Math.floor(Math.random() * activities.length)];
};

const salesReps = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Kim', 'Emma Wilson'];
const leadSources = ['Facebook', 'Instagram', 'Google Ads', 'Outreach', 'Referral', 'Website'];
const stages = ['New Lead', 'Appointment Booked', 'Appointment Completed', 'Membership Agreement', 'Closed Won', 'Closed Lost'];
const onboardingStages = ['15-min Gofast', 'AF Results', 'App Download', 'Membership Agreement'];
const statuses = ['hot', 'warm', 'cold'];

// Country and location data
const countries = [
  { id: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { id: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { id: 'th', name: 'Thailand', flag: '🇹🇭' },
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳' },
];

const locations = {
  ph: ['Manila Central', 'Makati Premium', 'Cebu Elite', 'Davao City', 'Quezon City'],
  id: ['Jakarta Elite', 'Bali Paradise', 'Surabaya Central', 'Bandung Premium'],
  my: ['Kuala Lumpur City', 'Penang Elite', 'Johor Bahru', 'Ipoh Central'],
  sg: ['Singapore Marina', 'Orchard Premium', 'Sentosa Elite'],
  th: ['Bangkok Central', 'Phuket Elite', 'Chiang Mai', 'Pattaya Beach'],
  vn: ['Ho Chi Minh Elite', 'Hanoi Central', 'Da Nang Premium'],
};

const getRandomCountry = () => {
  return countries[Math.floor(Math.random() * countries.length)];
};

const getRandomLocation = (countryId) => {
  const countryLocations = locations[countryId] || locations.ph;
  return countryLocations[Math.floor(Math.random() * countryLocations.length)];
};

const generateOpportunity = (overrides = {}) => {
  const country = getRandomCountry();
  const location = getRandomLocation(country.id);
  
  return {
    id: generateOpportunityId(),
    name: `Fitness Membership - ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    contact: `Contact ${Math.floor(Math.random() * 1000)}`,
    stage: stages[Math.floor(Math.random() * stages.length)],
    value: Math.floor(Math.random() * 2000) + 500,
    source: leadSources[Math.floor(Math.random() * leadSources.length)],
    assignedTo: salesReps[Math.floor(Math.random() * salesReps.length)],
    createdDate: getRandomDate(30),
    lastActivity: getRandomLastActivity(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    country: `${country.flag} ${country.name}`,
    location: location,
    ...overrides,
  };
};

export const generateOpportunitiesForMetric = (
  metricType,
  count,
  salesMetrics,
  onboardingMetrics
) => {
  const opportunities = [];

  switch (metricType) {
    case 'total-leads':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'New Lead',
          value: Math.floor(Math.random() * 1500) + 300,
        }));
      }
      break;

    case 'total-appointments':
      for (let i = 0; i < count; i++) {
        const isCompleted = Math.random() > 0.3;
        opportunities.push(generateOpportunity({
          stage: isCompleted ? 'Appointment Completed' : 'Appointment Booked',
          value: Math.floor(Math.random() * 1800) + 400,
        }));
      }
      break;

    case 'shown-appointments':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Appointment Completed',
          value: Math.floor(Math.random() * 1800) + 400,
          status: 'hot',
        }));
      }
      break;

    case 'total-njms':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Membership Agreement',
          value: Math.floor(Math.random() * 2500) + 800,
          status: 'hot',
        }));
      }
      break;

    case 'contacted-njms':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Contacted',
          value: Math.floor(Math.random() * 2200) + 700,
          status: Math.random() > 0.3 ? 'warm' : 'hot',
        }));
      }
      break;

    case 'membership-agreements':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Closed Won',
          value: Math.floor(Math.random() * 3000) + 1000,
          status: 'hot',
        }));
      }
      break;

    case 'online-leads':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'New Lead',
          source: ['Facebook', 'Instagram', 'Google Ads'][Math.floor(Math.random() * 3)],
          value: Math.floor(Math.random() * 1200) + 300,
        }));
      }
      break;

    case 'offline-leads':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'New Lead',
          source: ['Outreach', 'Referral', 'Walk-in'][Math.floor(Math.random() * 3)],
          value: Math.floor(Math.random() * 1500) + 400,
        }));
      }
      break;

    case 'leads-without-tags':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'New Lead',
          source: 'Unknown',
          value: Math.floor(Math.random() * 1000) + 200,
          status: 'cold',
        }));
      }
      break;

    case 'paid-media-njms':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          source: ['Facebook', 'Instagram', 'Google Ads'][Math.floor(Math.random() * 3)],
          stage: 'Membership Agreement',
          value: Math.floor(Math.random() * 2800) + 900,
          status: 'hot',
        }));
      }
      break;

    case '15-min-gofast':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: '15-min Gofast',
          value: Math.floor(Math.random() * 1500) + 500,
          name: `15-min Gofast Assessment - ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        }));
      }
      break;

    case 'af-results':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'AF Results',
          value: Math.floor(Math.random() * 1800) + 600,
          name: `AF Results - ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        }));
      }
      break;

    case 'app-downloads':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'App Download',
          value: Math.floor(Math.random() * 1200) + 400,
          name: `App Download - ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        }));
      }
      break;

    case 'defaulter-1m':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Default 1M',
          status: 'hot',
        }));
      }
      break;
    case 'defaulter-2m':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Default 2M',
          status: 'warm',
        }));
      }
      break;
    case 'defaulter-3m':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Default 3M',
          status: 'cold',
        }));
      }
      break;
    case 'defaulter-paid':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Paid',
          status: 'hot',
        }));
      }
      break;
    case 'defaulter-ptp':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'PTP',
          status: 'warm',
        }));
      }
      break;
    case 'defaulter-noresponse':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'No Response',
          status: 'cold',
        }));
      }
      break;
    case 'defaulter-cancelled':
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity({
          stage: 'Cancelled',
          status: 'cold',
        }));
      }
      break;

    default:
      for (let i = 0; i < count; i++) {
        opportunities.push(generateOpportunity());
      }
  }

  return opportunities;
};

export const generateTabbedOpportunities = (
  metricType,
  salesMetrics,
  onboardingMetrics
) => {
  switch (metricType) {
    case 'online-vs-offline':
      const onlineCount = Math.floor(salesMetrics.totalLeads * 0.75);
      const offlineCount = Math.floor(salesMetrics.totalLeads * 0.25);
      return [
        {
          id: 'online',
          label: 'Online Leads',
          count: onlineCount,
          opportunities: generateOpportunitiesForMetric('online-leads', onlineCount, salesMetrics),
        },
        {
          id: 'offline',
          label: 'Offline Leads',
          count: offlineCount,
          opportunities: generateOpportunitiesForMetric('offline-leads', offlineCount, salesMetrics),
        },
      ];

    case 'lead-to-sale':
      return [
        {
          id: 'total-leads',
          label: 'Total Leads',
          count: salesMetrics.totalLeads,
          opportunities: generateOpportunitiesForMetric('total-leads', salesMetrics.totalLeads, salesMetrics),
        },
        {
          id: 'njms',
          label: 'NJMs (Sales)',
          count: salesMetrics.totalNJMs,
          opportunities: generateOpportunitiesForMetric('total-njms', salesMetrics.totalNJMs, salesMetrics),
        },
      ];

    case 'lead-to-appointment':
      return [
        {
          id: 'total-leads',
          label: 'Total Leads',
          count: salesMetrics.totalLeads,
          opportunities: generateOpportunitiesForMetric('total-leads', salesMetrics.totalLeads, salesMetrics),
        },
        {
          id: 'appointments',
          label: 'Appointments',
          count: salesMetrics.totalAppointments,
          opportunities: generateOpportunitiesForMetric('total-appointments', salesMetrics.totalAppointments, salesMetrics),
        },
      ];

    case 'appointment-to-sale':
      return [
        {
          id: 'appointments',
          label: 'Appointments',
          count: salesMetrics.totalAppointments,
          opportunities: generateOpportunitiesForMetric('total-appointments', salesMetrics.totalAppointments, salesMetrics),
        },
        {
          id: 'njms',
          label: 'NJMs (Sales)',
          count: salesMetrics.totalNJMs,
          opportunities: generateOpportunitiesForMetric('total-njms', salesMetrics.totalNJMs, salesMetrics),
        },
      ];

    case 'assessment-uptake':
      if (!onboardingMetrics) return [];
      const gofastCount = Math.floor(salesMetrics.membershipAgreements * (onboardingMetrics.assessmentUptake / 100));
      return [
        {
          id: '15-min-gofast',
          label: '15-min Gofast',
          count: gofastCount,
          opportunities: generateOpportunitiesForMetric('15-min-gofast', gofastCount, salesMetrics, onboardingMetrics),
        },
        {
          id: 'membership-agreements',
          label: 'Membership Agreements',
          count: salesMetrics.membershipAgreements,
          opportunities: generateOpportunitiesForMetric('membership-agreements', salesMetrics.membershipAgreements, salesMetrics),
        },
      ];

    case 'af-conversion':
      if (!onboardingMetrics) return [];
      const gofastTotal = Math.floor(salesMetrics.membershipAgreements * (onboardingMetrics.assessmentUptake / 100));
      const afResultsCount = Math.floor(gofastTotal * (onboardingMetrics.conversionRate / 100));
      return [
        {
          id: 'af-results',
          label: 'AF Results',
          count: afResultsCount,
          opportunities: generateOpportunitiesForMetric('af-results', afResultsCount, salesMetrics, onboardingMetrics),
        },
        {
          id: '15-min-gofast',
          label: '15-min Gofast',
          count: gofastTotal,
          opportunities: generateOpportunitiesForMetric('15-min-gofast', gofastTotal, salesMetrics, onboardingMetrics),
        },
      ];

    case 'app-adoption':
      if (!onboardingMetrics) return [];
      const appDownloads = Math.floor(salesMetrics.membershipAgreements * (onboardingMetrics.appAdoptionRate / 100));
      return [
        {
          id: 'app-downloads',
          label: 'App Downloads',
          count: appDownloads,
          opportunities: generateOpportunitiesForMetric('app-downloads', appDownloads, salesMetrics, onboardingMetrics),
        },
        {
          id: 'membership-agreements',
          label: 'Membership Agreements',
          count: salesMetrics.membershipAgreements,
          opportunities: generateOpportunitiesForMetric('membership-agreements', salesMetrics.membershipAgreements, salesMetrics),
        },
      ];

    case 'af-results':
      if (!onboardingMetrics) return [];
      const afCount = Math.floor(salesMetrics.membershipAgreements * (onboardingMetrics.afResults / 100));
      return [
        {
          id: 'af-results-completed',
          label: 'AF Results Completed',
          count: afCount,
          opportunities: generateOpportunitiesForMetric('af-results', afCount, salesMetrics, onboardingMetrics),
        },
      ];

    default:
      return [];
  }
};