import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, DollarSign, TrendingDown } from 'lucide-react';
import { useAppSelector } from '../hooks';
import { store } from '../store';
import OpportunityModal from './OpportunityModal';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';
import metricTypeConfigs from '../config/metricTypes';

const PAGE_SIZE = 10;

const stageNames = [
  'D1',
  'D2',
  'D3',
  'Paid',
  'PTP',
  'No Response',
  'Cancelled Membership',
];

const metricTypeKeys = [
  'defaulter-1m',
  'defaulter-2m',
  'defaulter-3m',
  'defaulter-paid',
  'defaulter-ptp',
  'defaulter-noresponse',
  'defaulter-cancelled',
  null, // Communications Sent (no modal)
  null, // PTP Conversion (no modal)
  null, // Payment Recovery Rate (no modal)
];

const DefaulterPipeline = () => {
  const { defaulterMetrics, filters, countries, loading } = useAppSelector((state) => state.dashboard);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    opportunities: [],
    totalCount: 0,
    loading: false,
    error: null,
    metricType: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to map filters to API params (same as SalesPipeline)
  const buildOpportunityParams = (metricTypeKey) => {
    const params = {};
    if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
      params.assigned_to = filters.assignedUser;
    }
    if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
      params.country = filters.country;
    }
    if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
      params.location = filters.club;
    }
    if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
      params.lead_source = filters.leadSource;
    }
    
    // Handle pipeline filtering - combine metric type config with user filter
    const metricConfig = metricTypeConfigs[metricTypeKey] || {};
    const metricPipeline = metricConfig.pipeline_name;
    
    if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
      // Convert user's pipeline categories to their actual pipeline values
      const { pipelines } = store.getState().dashboard;
      const userPipelineValues = [];
      
      filters.pipeline.forEach(category => {
        const categoryData = pipelines[category];
        if (categoryData && Array.isArray(categoryData)) {
          userPipelineValues.push(...categoryData);
        }
      });
      
      // Always use user filter when user has selected specific pipelines
      if (userPipelineValues.length > 0) {
        params.pipeline_name = userPipelineValues;
      }
    } else if (metricPipeline) {
      // If no user filter but metric type has pipeline, use metric type pipeline
      params.pipeline_name = metricPipeline;
    }
    
    if (filters.dateRange === 'custom-range' && filters.customStartDate && filters.customEndDate) {
      params.created_at_min = filters.customStartDate;
      params.created_at_max = filters.customEndDate;
    }
    // Metric-specific params from config (but don't override pipeline_name if we set it above)
    if (metricTypeConfigs[metricTypeKey]) {
      const configWithoutPipeline = { ...metricTypeConfigs[metricTypeKey] };
      delete configWithoutPipeline.pipeline_name; // Don't override our pipeline logic
      Object.assign(params, configWithoutPipeline);
    }
    return params;
  };

  // Show loading state when data is being fetched or when data doesn't exist
  if (loading || !defaulterMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {loading ? 'Loading defaulter metrics...' : 'No data available'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total 1-Month Defaulters',
      value: defaulterMetrics.totalDefaulters,
      description: 'Members in default status (D1)',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
      isPercentage: false,
      stage_name: 'D1',
    },
    {
      title: 'Total 2-Month Defaulters',
      value: defaulterMetrics.totalDefaulters2Month,
      description: 'Members in default status (D2)',
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      isPercentage: false,
      stage_name: 'D2',
    },
    {
      title: 'Total 3-Month Defaulters',
      value: defaulterMetrics.totalDefaulters3Month,
      description: 'Members in default status (D3)',
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      isPercentage: false,
      stage_name: 'D3',
    },
    {
      title: 'Paid',
      value: defaulterMetrics.paid,
      description: 'Number of members who paid',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      isPercentage: false,
      stage_name: 'Paid',
    },
    {
      title: 'Total PTP',
      value: defaulterMetrics.totalPTP,
      description: 'Total Promise to Pay cases',
      icon: TrendingDown,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      isPercentage: false,
      stage_name: 'PTP',
    },
    {
      title: 'No Response',
      value: defaulterMetrics.noResponse,
      description: 'No response from members',
      icon: MessageCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900',
      isPercentage: false,
      stage_name: 'No Response',
    },
    {
      title: 'Cancelled Membership',
      value: defaulterMetrics.cancelledMembership,
      description: 'Memberships cancelled',
      icon: AlertTriangle,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900',
      isPercentage: false,
      stage_name: 'Cancelled Membership',
    },
    {
      title: 'Communications Sent',
      value: defaulterMetrics.communicationsSent,
      description: 'Number of contacts under Calls stage',
      icon: MessageCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      isPercentage: false,
    },
    {
      title: 'Promise to Pay Conversion',
      value: `${defaulterMetrics.ptpConversion}%`,
      description: 'Paid ÷ Total PTP',
      icon: TrendingDown,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      isPercentage: true,
    },
    {
      title: 'Payment Recovery Rate',
      value: `${defaulterMetrics.paymentRecoveryRate}%`,
      description: 'Paid ÷ Total in Default',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      isPercentage: true,
    },
  ];

  const handleCardClick = async (metric, index, page = 1) => {
    const metricTypeKey = metricTypeKeys[index];
    if (!metricTypeKey) return;
    setModalData((prev) => ({ ...prev, isOpen: true, title: metric.title + ' - GHL Opportunities', loading: true, error: null, opportunities: [], totalCount: metric.value, metricType: metricTypeKey }));
    try {
      const params = buildOpportunityParams(metricTypeKey);
      params.page = page;
      const data = await fetchOpportunities(params);
      const normalized = normalizeOpportunitiesResponse(data, countries);
      setModalData((prev) => ({ ...prev, loading: false, opportunities: normalized, totalCount: data.count, metricType: metricTypeKey }));
      setCurrentPage(page);
    } catch (error) {
      setModalData((prev) => ({ ...prev, loading: false, error: error.message || 'Failed to fetch opportunities', metricType: metricTypeKey }));
    }
  };

  const closeModal = () => setModalData({ ...modalData, isOpen: false });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Defaulter Management Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isClickable = !!metric.stage_name;
          return (
            <div
              key={index}
              className={`border border-gray-100 dark:border-gray-700 rounded-lg p-6 transition-shadow duration-200 bg-white dark:bg-gray-800${isClickable ? ' cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.03] transform' : ' hover:shadow-md'}`}
              onClick={isClickable ? () => handleCardClick(metric, index) : undefined}
              style={{ transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}> 
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.isPercentage ? metric.value : typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{metric.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <OpportunityModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        opportunities={modalData.opportunities}
        totalCount={modalData.totalCount}
        loading={modalData.loading}
        error={modalData.error}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => handleCardClick(metrics[metricTypeKeys.findIndex(k => k === modalData.metricType)], metricTypeKeys.findIndex(k => k === modalData.metricType), page)}
      />
    </div>
  );
};

export default DefaulterPipeline;