import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import OpportunityModal from './OpportunityModal';
import { generateOpportunitiesForMetric, generateTabbedOpportunities } from '../utils/mockOpportunityData';
import { useAppSelector } from '../hooks';
import LeadSourcesChart from './charts/LeadSourcesChart';
import AppointmentStatusChart from './charts/AppointmentStatusChart';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';

const ChartSection = ({ leadSources, appointmentStatus }) => {
  
  const { salesMetrics } = useAppSelector((state) => state.dashboard);
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
        opportunities = normalizeOpportunitiesResponse(apiData);
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
          leadSources={leadSources}
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