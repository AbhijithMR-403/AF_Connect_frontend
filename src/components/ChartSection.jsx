import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import OpportunityModal from './OpportunityModal';
import { useAppSelector } from '../hooks';
import LeadSourcesChart from './charts/LeadSourcesChart';
import AppointmentStatusChart from './charts/AppointmentStatusChart';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';

const LEAD_SOURCE_COLORS = [
  '#0D9488', '#7C3AED', '#FBBF24', '#14B8A6', '#F87171', '#A21CAF', '#0EA5E9',
  '#F43F5E', '#F59E42', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1', '#F472B6',
  '#25D366', '#111827', '#EC4899', '#3B82F6', '#06B6D4', '#84CC16', '#F97316',
  '#8B5A2B', '#4F46E5', '#DC2626', '#059669', '#7C2D12', '#BE185D', '#1E40AF',
  '#15803D', '#C2410C', '#9D174D', '#1E293B', '#475569', '#64748B', '#94A3B8'
];

function assignColorsToLeadSources(leadSources) {
  if (!Array.isArray(leadSources) || leadSources.length > LEAD_SOURCE_COLORS.length) {
    // If more than 18, do not assign colors
    return leadSources;
  }
  return leadSources.map((source, idx) => ({
    ...source,
    color: LEAD_SOURCE_COLORS[idx]
  }));
}

const ChartSection = ({ leadSources, appointmentStatus, openModal }) => {

  const { salesMetrics } = useAppSelector((state) => state.dashboard);

  // Remove all modal state and logic

  // Remove PieTooltip if only used for modal

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Lead Sources Breakdown */}
        <LeadSourcesChart 
          leadSources={assignColorsToLeadSources(leadSources)}
          openModal={(metricType, title, count, data) => openModal("lead-source", title, count, 1, { lead_source: data?.name })}
        />
        {/* Appointment Status */}
        
        <AppointmentStatusChart 
          appointmentStatus={appointmentStatus}
          openModal={(metricType, title, count, data) => openModal("appointment-status", title, count, 1, { appointment_status: data?.status?.toLowerCase() })}
        />
      </div>
    </>
  );
};

export default ChartSection;