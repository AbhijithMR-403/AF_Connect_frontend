import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import OpportunityModal from './OpportunityModal';
import { generateOpportunitiesForMetric, generateTabbedOpportunities } from '../utils/mockOpportunityData';
import { useAppSelector } from '../hooks';
import LeadSourcesChart from './charts/LeadSourcesChart';
import AppointmentStatusChart from './charts/AppointmentStatusChart';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';

const LEAD_SOURCE_COLORS = [
  '#0D9488', '#7C3AED', '#FBBF24', '#14B8A6', '#F87171', '#A21CAF', '#0EA5E9',
  '#F43F5E', '#F59E42', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1', '#F472B6',
  '#25D366', '#111827', '#EC4899', '#3B82F6'
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

const ChartSection = ({ leadSources, appointmentStatus }) => {
  
  const { salesMetrics, countries } = useAppSelector((state) => state.dashboard);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    opportunities: [],
    totalCount: 0,
    tabs: null,
  });

  const openModal = async (metricType, title, count, data) => {
    if (!salesMetrics) return;
    let opportunities = [];
    if (metricType === 'lead-source' && data && data.name) {
      // Fetch from API with lead_source param
      try {
        const apiData = await fetchOpportunities({ lead_source: data.name, limit: Math.min(count, 50) });
        opportunities = normalizeOpportunitiesResponse(apiData, countries);
      } catch (e) {
        opportunities = [];
      }
    } else {
      // fallback to mock for other types (or implement API as needed)
      opportunities = generateOpportunitiesForMetric(metricType, Math.min(count, 50), salesMetrics);
    }
    setModalData({
      isOpen: true,
      title,
      opportunities,
      totalCount: count,
      tabs: null,
    });
  };

  const openTabbedModal = (metricType, title) => {
    if (!salesMetrics) return;
    
    const tabs = generateTabbedOpportunities(metricType, salesMetrics);
    setModalData({
      isOpen: true,
      title,
      opportunities: [],
      totalCount: 0,
      tabs,
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      title: '',
      opportunities: [],
      totalCount: 0,
      tabs: null,
    });
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{`${data.status || data.name}: ${data.count || data.value}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{`${data.percentage}%`}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to view opportunities</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Lead Sources Breakdown */}
        <LeadSourcesChart 
          leadSources={assignColorsToLeadSources(leadSources)}
          openModal={openModal}
        />
        {/* Appointment Status */}
        <AppointmentStatusChart 
          appointmentStatus={appointmentStatus}
          openModal={openModal}
          PieTooltip={PieTooltip}
        />
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        opportunities={modalData.opportunities}
        totalCount={modalData.totalCount}
        tabs={modalData.tabs}
      />
    </>
  );
};

export default ChartSection;