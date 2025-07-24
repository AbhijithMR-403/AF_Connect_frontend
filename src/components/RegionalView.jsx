import React, { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useAppSelector } from '../hooks';

const RegionalView = () => {
  const { locations, countries } = useAppSelector((state) => state.dashboard);

  // Sorting state
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Use locations from API
  const locationData = locations;

  // Columns config for sorting
  const columns = [
    { key: 'club', label: 'Club' },
    { key: 'country', label: 'Country' },
    { key: 'total_leads', label: 'Total Leads' },
    { key: 'appointment_showed', label: 'Appointment Showed' },
    { key: 'total_njms', label: 'Total NJMs' }, // Added column
    { key: 'lead_to_sale', label: 'Lead:Sale (%)' },
    { key: 'appointment_to_sale', label: 'Appointment:Sale (%)' },
  ];

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortColumn) return locationData;
    return [...locationData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      // Numeric sort if both are numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // String sort (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, undefined, { sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { sensitivity: 'base' });
      }
      // Fallback
      return 0;
    });
  }, [locationData, sortColumn, sortDirection]);

  // Handle header click
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

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
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="ml-1 inline-block align-middle">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((loc, idx) => (
                <tr key={loc.club + '-' + idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{loc.club}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{loc.country}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">{loc.total_leads?.toLocaleString?.() ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-green-600 dark:text-green-400 font-medium">{loc.appointment_showed?.toLocaleString?.() ?? '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-purple-600 dark:text-purple-400 font-medium">{loc.total_njms?.toLocaleString?.() ?? '-'}</td> {/* Total NJMs */}
                  <td className="px-4 py-3 whitespace-nowrap text-orange-600 dark:text-orange-400 font-medium">{typeof loc.lead_to_sale === 'number' ? loc.lead_to_sale.toFixed(2) + '%' : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">{typeof loc.appointment_to_sale === 'number' ? loc.appointment_to_sale.toFixed(2) + '%' : '-'}</td>
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
              {locationData.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Clubs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalView;