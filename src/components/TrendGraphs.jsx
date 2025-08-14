import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useAppSelector } from '../hooks';
import OpportunityModal from './OpportunityModal';
// import { generateOpportunitiesForMetric } from '../utils/mockOpportunityData';

const TrendGraphs = () => {
  const { salesMetrics, trendSums } = useAppSelector((state) => state.dashboard);
  const [activeView, setActiveView] = useState('daily');

  // Restore trendReport state and related functions
  const [trendReport, setTrendReport] = useState({ isOpen: false, metric: '', data: [] });

  // Helper to get the correct trend data slice for modal
  const getTrendReportData = (metric) => {
    if (!salesMetrics || !salesMetrics.trend) return [];
    const data = salesMetrics.trend[activeView] || [];
    if (activeView === 'daily') return data.slice(-7).map(d => ({ period: d.period, value: d[metric] }));
    if (activeView === 'weekly') return data.slice(-9).map(d => ({ period: d.period, value: d[metric] }));
    if (activeView === 'monthly') return data.slice(-12).map(d => ({ period: d.period, value: d[metric] }));
    return [];
  };

  const openTrendReport = (metric, label) => {
    setTrendReport({
      isOpen: true,
      metric: label,
      data: getTrendReportData(metric),
    });
  };

  const closeTrendReport = () => setTrendReport({ isOpen: false, metric: '', data: [] });

  if (!salesMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Use trend data from opportunity_dash if available
  const trendData = salesMetrics && salesMetrics.trend && salesMetrics.trend[activeView]
    ? salesMetrics.trend[activeView]
    : [];
  
  // Check if all values in trends are none/null
  const hasValidTrendData = trendData.length > 0 && trendData.some(item => 
    (item.leads && item.leads !== null && item.leads !== undefined) ||
    (item.appointments && item.appointments !== null && item.appointments !== undefined) ||
    (item.njms && item.njms !== null && item.njms !== undefined)
  );
  
  const viewOptions = [
    { value: 'daily', label: 'Daily', period: 'Last 7 Days' },
    { value: 'weekly', label: 'Weekly', period: 'Last 8 Weeks' },
    { value: 'monthly', label: 'Monthly', period: 'Last 6 Months' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
          {/* <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to view opportunities</p> */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Trends
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveView(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeView === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Leads Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 cursor-pointer" onClick={() => openTrendReport('leads', 'Leads')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Leads</span>
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {trendSums?.[activeView]?.leads?.toLocaleString() || '0'}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Current {activeView.slice(0, -2)} period
          </p>
        </div>

        {/* Appointments Summary */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4 border border-green-200 dark:border-green-700 cursor-pointer" onClick={() => openTrendReport('appointments', 'Appointments')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Appointments</span>
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {trendSums?.[activeView]?.appointments?.toLocaleString() || '0'}
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Current {activeView.slice(0, -2)} period
          </p>
        </div>

        {/* NJMs Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 cursor-pointer" onClick={() => openTrendReport('njms', 'NJMs')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">NJMs</span>
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {trendSums?.[activeView]?.njms?.toLocaleString() || '0'}
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Current {activeView.slice(0, -2)} period
          </p>
        </div>
      </div>

      {/* No Data Message */}
      {!hasValidTrendData && (
        <div className="flex flex-col items-center justify-center h-80 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Trend Data Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              There is no trend data available for the selected time period. Please check back later or try a different time range.
            </p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {hasValidTrendData && (
        <div className="h-80">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {viewOptions.find(opt => opt.value === activeView)?.period}
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#047857" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="njmsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#6D28D9" stopOpacity={1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              strokeOpacity={0.5}
              className="dark:stroke-gray-600"
            />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              className="dark:fill-gray-400"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              className="dark:fill-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            
            <Bar 
              dataKey="leads" 
              name="Leads"
              fill="url(#leadsGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              // cursor="pointer"
            />
            <Bar 
              dataKey="appointments" 
              name="Appointments"
              fill="url(#appointmentsGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              // cursor="pointer"
            />
            <Bar 
              dataKey="njms" 
              name="NJMs"
              fill="url(#njmsGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              // cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}


      {/* Trend Report Modal */}
      {trendReport.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={closeTrendReport}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{trendReport.metric} Report ({activeView.charAt(0).toUpperCase() + activeView.slice(1)})</h2>
              <button onClick={closeTrendReport} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0">
                <span className="text-gray-500 dark:text-gray-300">✕</span>
              </button>
            </div>
            <div className="p-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300">Period</th>
                    <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {trendReport.data.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-gray-900 dark:text-white">{row.period}</td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-white">{row.value?.toLocaleString() ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendGraphs;
