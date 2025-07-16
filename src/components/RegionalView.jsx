import React from 'react';
import { Globe } from 'lucide-react';
import { useAppSelector } from '../hooks';

const RegionalView = () => {
  const { salesMetrics, countries } = useAppSelector((state) => state.dashboard);

  if (!salesMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Generate country performance data
  const generateCountryData = () => {
    return countries.map((country, index) => {
      const baseMultiplier = 1 + (Math.random() * 0.4 - 0.2); // ±20% variation
      const countryMultiplier = country.clubCount / 20; // Scale by club count
      
      const totalLeads = Math.floor(salesMetrics.totalLeads * countryMultiplier * baseMultiplier / 6);
      const appointments = Math.floor(salesMetrics.totalAppointments * countryMultiplier * baseMultiplier / 6);
      const appointmentShowed = Math.floor(appointments * 0.65);
      const njms = Math.floor(salesMetrics.totalNJMs * countryMultiplier * baseMultiplier / 6);
      
      return {
        id: country.id,
        name: country.name,
        flag: country.flag,
        clubCount: country.clubCount,
        totalLeads,
        appointments,
        appointmentShowed,
        njms,
        leadToSale: totalLeads > 0 ? ((njms / totalLeads) * 100) : 0,
        appointmentToSale: appointmentShowed > 0 ? ((njms / appointmentShowed) * 100) : 0,
        color: [
          '#3B82F6', // Blue
          '#10B981', // Green  
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#06B6D4'  // Cyan
        ][index % 6]
      };
    });
  };

  const countryData = generateCountryData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🌍 Regional View</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Country performance leaderboards and comparisons</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Country Club Performance Table
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed metrics for each country and club
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Club</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Leads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appointment Showed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lead:Sale (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appointment:Sale (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {countryData.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{country.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">{country.totalLeads.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-green-600 dark:text-green-400 font-medium">{country.appointmentShowed.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-orange-600 dark:text-orange-400 font-medium">{country.leadToSale.toFixed(1)}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">{country.appointmentToSale.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {countries.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {countries.reduce((sum, country) => sum + country.clubCount, 0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Clubs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalView;