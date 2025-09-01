import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Table, Percent } from 'lucide-react';

const CountryPerformancePercentageChart = ({ data, onCountryClick }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Calculate percentage data
  const percentageData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate total values across all countries
    const totals = data.reduce((acc, country) => {
      acc.total_leads += country.total_leads || 0;
      acc.appointment_showed += country.appointment_showed || 0;
      acc.total_njm += country.total_njm || 0;
      return acc;
    }, { total_leads: 0, appointment_showed: 0, total_njm: 0 });

    // Convert to percentages
    return data.map(country => ({
      ...country,
      leads_percentage: totals.total_leads > 0 ? ((country.total_leads || 0) / totals.total_leads * 100) : 0,
      appointments_percentage: totals.appointment_showed > 0 ? ((country.appointment_showed || 0) / totals.appointment_showed * 100) : 0,
      njm_percentage: totals.total_njm > 0 ? ((country.total_njm || 0) / totals.total_njm * 100) : 0
    }));
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const countryData = payload[0].payload;
      return (
        <div 
          className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg backdrop-blur-sm cursor-pointer"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onCountryClick && countryData) {
              onCountryClick(countryData);
            }
          }}
        >
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Leads: {countryData.leads_percentage?.toFixed(1)}% ({countryData.total_leads?.toLocaleString() ?? 0})
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Appointments: {countryData.appointments_percentage?.toFixed(1)}% ({countryData.appointment_showed?.toLocaleString() ?? 0})
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              NJMs: {countryData.njm_percentage?.toFixed(1)}% ({countryData.total_njm?.toLocaleString() ?? 0})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clubs: {countryData.clubs?.length ?? 0}
            </p>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline">
            Click to view club details
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle chart background click to show hovered country details
  const handleChartBackgroundClick = (event) => {
    if (!onCountryClick || !hoveredCountry) return;
    
    // Find the hovered country data
    const clickedCountry = data.find(item => item.country === hoveredCountry);
    if (clickedCountry) {
      onCountryClick(clickedCountry);
    }
  };

  // Handle bar click
  const handleBarClick = (data) => {
    if (onCountryClick && data && data.country) {
      onCountryClick(data);
    }
  };

  // Handle individual bar click
  const handleIndividualBarClick = (data, index) => {
    if (onCountryClick && data && data.country) {
      onCountryClick(data);
    }
  };

  // Handle mouse enter to track hovered country
  const handleMouseEnter = (data) => {
    if (data && data.country) {
      setHoveredCountry(data.country);
    }
  };

  // Handle mouse leave to clear hovered country
  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  // Check if data is empty
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Country Performance (Percentage)</h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No country data available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data will appear here once country metrics are available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Country Performance (Percentage)</h3>
        </div>
        <button
          onClick={() => onCountryClick && onCountryClick({ country: null })}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <Table className="w-4 h-4" />
          View All
        </button>
      </div>
      <div 
        className="h-80 sm:h-96 cursor-pointer"
        onClick={handleChartBackgroundClick}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={percentageData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <defs>
              <linearGradient id="leadsPercentageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="appointmentsPercentageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="njmPercentageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="country" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              axisLine={{ stroke: '#D1D5DB' }}
              tickLine={{ stroke: '#D1D5DB' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar 
              dataKey="leads_percentage" 
              name="Leads"
              fill="url(#leadsPercentageGradient)" 
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleIndividualBarClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <Bar 
              dataKey="appointments_percentage" 
              name="Appointments"
              fill="url(#appointmentsPercentageGradient)" 
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleIndividualBarClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <Bar 
              dataKey="njm_percentage" 
              name="NJMs"
              fill="url(#njmPercentageGradient)" 
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleIndividualBarClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CountryPerformancePercentageChart;

