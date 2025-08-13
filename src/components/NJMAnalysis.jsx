import React from 'react';
import { Target, Phone, BarChart3, TrendingUp } from 'lucide-react';
import ClickableMetricCard from './ClickableMetricCard';
import LeadSourcesChart from './charts/LeadSourcesChart';
import { useAppSelector } from '../hooks';

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
const NJMAnalysis = ({ salesMetrics, openModal }) => {
  const { validLeadSources } = useAppSelector((state) => state.dashboard);

  // Helper to convert lead source key to value
  const convertLeadSourceKeyToValue = (key) => {
    if (!Array.isArray(validLeadSources)) return key;
    const leadSource = validLeadSources.find(ls => ls.label === key);
    return leadSource ? leadSource.value : key;
  };

  if (!salesMetrics) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NJM Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LeadSourcesChart on the left, spanning two columns on large screens */}
        <div className="col-span-1 lg:col-span-2 order-1">
          <LeadSourcesChart
            leadSources={assignColorsToLeadSources(salesMetrics.leadSourceSaleBreakdown)}
            openModal={(metricType, title, count, data) => openModal(metricType, title, count, 1, { lead_source: data?.name })}
          />
        </div>
        {/* Right column: stack Contacted and Paid Media cards vertically */}
        <div className="order-2 flex flex-col gap-6">
          <ClickableMetricCard
            title="Contacted"
            value={Math.round(salesMetrics.totalContacted)}
            icon={Phone}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            onClick={() => openModal('contacted-njms', 'Contacted NJMs - GHL Opportunities', Math.round(0))}
          />
          <button
            type="button"
            onClick={() => openModal('paid-media-njms', 'NJM from Paid Media - GHL Opportunities', Math.round(salesMetrics.totalPaidMedia))}
            className="text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">NJM from Paid Media</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(salesMetrics.totalPaidMedia)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Facebook + IG + Google Ads + Whatsapp</p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NJMAnalysis; 