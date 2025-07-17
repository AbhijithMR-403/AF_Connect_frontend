const metricTypeConfigs = {
  'total-njms': {
    pipeline_name: 'AFC Sales Pipeline',
    stage_name: 'Sale',
  },
  'total-appointments': {
    pipeline_name: 'AFC Sales Pipeline',
    stage_name: 'Appointment Booked',
  },
  'leads-without-tags': {
    pipeline_name: 'AFC Sales Pipeline',
    contact_tags: 6,
  },
  'total-leads': {
    pipeline_name: 'AFC Sales Pipeline',
    stage_name: ['Lead Generation', 'Qualified Leads'],
  },
  'online-leads': {
    pipeline_name: 'AFC Sales Pipeline',
    contact_tags: 2,
  },
  'offline-leads': {
    pipeline_name: 'AFC Sales Pipeline',
    contact_tags: 3,
  },
  // Defaulter metrics
  'defaulter-1m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D1' },
  'defaulter-2m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D2' },
  'defaulter-3m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D3' },
  'defaulter-paid': { pipeline_name: 'Defaulter Pipeline', stage_name: 'Paid' },
  'defaulter-ptp': { pipeline_name: 'Defaulter Pipeline', stage_name: 'PTP' },
  'defaulter-noresponse': { pipeline_name: 'Defaulter Pipeline', stage_name: 'No Response' },
  'defaulter-cancelled': { pipeline_name: 'Defaulter Pipeline', stage_name: 'Cancelled Membership' },
  // Add more metric types here as needed
};

export default metricTypeConfigs; 