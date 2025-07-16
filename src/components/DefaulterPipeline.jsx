import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, DollarSign, TrendingDown } from 'lucide-react';
import { useAppSelector } from '../hooks';
import OpportunityModal from './OpportunityModal';
import { generateOpportunitiesForMetric } from '../utils/mockOpportunityData';

const DefaulterPipeline = () => {
  const { defaulterMetrics } = useAppSelector((state) => state.dashboard);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', opportunities: [], totalCount: 0 });

  if (!defaulterMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Map metric index to metricType for generateOpportunitiesForMetric
  const metricTypes = [
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

  const metrics = [
    {
      title: 'Total 1-Month Defaulters',
      value: defaulterMetrics.totalDefaulters,
      description: 'Members in default status (D1)',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
      isPercentage: false,
    },
    {
      title: 'Total 2-Month Defaulters',
      value: defaulterMetrics.totalDefaulters2Month,
      description: 'Members in default status (D2)',
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      isPercentage: false,
    },
    {
      title: 'Total 3-Month Defaulters',
      value: defaulterMetrics.totalDefaulters3Month,
      description: 'Members in default status (D3)',
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      isPercentage: false,
    },
    {
      title: 'Paid',
      value: defaulterMetrics.paid,
      description: 'Number of members who paid',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      isPercentage: false,
    },
    {
      title: 'Total PTP',
      value: defaulterMetrics.totalPTP,
      description: 'Total Promise to Pay cases',
      icon: TrendingDown,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      isPercentage: false,
    },
    {
      title: 'No Response',
      value: defaulterMetrics.noResponse,
      description: 'No response from members',
      icon: MessageCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900',
      isPercentage: false,
    },
    {
      title: 'Cancelled Membership',
      value: defaulterMetrics.cancelledMembership,
      description: 'Memberships cancelled',
      icon: AlertTriangle,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900',
      isPercentage: false,
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

  const handleCardClick = (metric, index) => {
    const metricType = metricTypes[index];
    if (!metricType) return;
    // Use the value as count, but parse if string (for % metrics)
    let count = typeof metric.value === 'string' ? parseInt(metric.value) : metric.value;
    if (isNaN(count) || count <= 0) count = 10;
    const opportunities = generateOpportunitiesForMetric(metricType, count);
    setModalData({
      isOpen: true,
      title: metric.title + ' - GHL Opportunities',
      opportunities,
      totalCount: count,
    });
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
          // Only add cursor-pointer and enhanced hover for cards that are clickable (i.e., have a metricType)
          const isClickable = !!metricTypes[index];
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
      />
    </div>
  );
};

export default DefaulterPipeline;