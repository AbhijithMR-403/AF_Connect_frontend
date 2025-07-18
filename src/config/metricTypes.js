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
  'contacted-njms': {
    pipeline_name: 'AFC Sales Pipeline',
    stage_name: 'Initiate Contact',
  },
  'membership-agreements': {
    pipeline_name: 'Member Onboarding',
    stage_name: 'Membership Agreement',
  },
  'apps': {
    pipeline_name: 'Member Onboarding',
    stage_name: 'Apps',
  },
  '15min-gofast': {
    pipeline_name: 'Member Onboarding',
    stage_name: '15min GoFast',
  },
  'af-results': {
    pipeline_name: 'Member Onboarding',
    stage_name: 'AF Results',
  },
  // Defaulter metrics
  'defaulter-1m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D1' },
  'defaulter-2m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D2' },
  'defaulter-3m': { pipeline_name: 'Defaulter Pipeline', stage_name: 'D3' },
  'defaulter-paid': { pipeline_name: 'Defaulter Pipeline', stage_name: 'Paid' },
  'defaulter-ptp': { pipeline_name: 'Defaulter Pipeline', stage_name: 'PTP' },
  'defaulter-noresponse': { pipeline_name: 'Defaulter Pipeline', stage_name: 'No Response' },
  'defaulter-cancelled': { pipeline_name: 'Defaulter Pipeline', stage_name: 'Cancelled Membership' },
  'paid-media-njms': {
    pipeline_name: 'AFC Sales Pipeline',
    lead_source: ['Facebook', 'Whatsapp', 'Instagram', 
      // 'Google'
    ],
  },
  'njm-lead-source': {
    pipeline_name: 'AFC Sales Pipeline',
    stage_name: 'Sale',
  },
  'lead-source': {
    pipeline_name: 'AFC Sales Pipeline',
  },
  'appointment-status': {
    pipeline_name: 'AFC Sales Pipeline',
  },
  'shown-appointments': {
    pipeline_name: 'AFC Sales Pipeline',
    appointment_status: 'showed',
  },
  // Add more metric types here as needed
};

export default metricTypeConfigs; 