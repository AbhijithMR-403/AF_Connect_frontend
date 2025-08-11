import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const LeadSourcesChart = ({ leadSources, openModal }) => {
  // CustomTooltip defined inside the component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-semibold">{label}</div>
          <div>Leads: {data.value}</div>
          <div>Percentage: {data.percentage}%</div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data) => {
    openModal('njm-lead-source', `${data.name} Leads - GHL Opportunities`, data.value, data);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Lead Sources Breakdown</h3>
      <div className="space-y-1 sm:space-y-1 mb-2 sm:mb-3 max-h-56 overflow-y-auto hide-scrollbar">
        {leadSources.map((source, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            onClick={() => handleBarClick(source)}
          >
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: source.color }}
              ></div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{source.name}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-1">
              <div className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-white">
                {source.value.toLocaleString()}
              </div>
              <div className="text-[9px] text-gray-500 dark:text-gray-400">{source.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-48 sm:h-64 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={leadSources} 
            margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="url(#barGradient)" 
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadSourcesChart; 