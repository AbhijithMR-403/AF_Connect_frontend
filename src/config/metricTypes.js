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
    stage_name: 'Lead Generation',
    stage_name: 'Qualified Leads',
  },
  'online-leads': {
    pipeline_name: 'AFC Sales Pipeline',
    contact_tags: 2,
  },
  'offline-leads': {
    pipeline_name: 'AFC Sales Pipeline',
    contact_tags: 3,
  },
  // Add more metric types here as needed
};

export default metricTypeConfigs; 