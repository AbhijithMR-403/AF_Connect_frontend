import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const CountryTableModal = ({ isOpen, onClose, locationData = [], countries = [], selectedCountry = null }) => {
  // Sorting state
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Columns config for sorting
  const columns = [
    { key: 'club', label: 'Club' },
    { key: 'country', label: 'Country' },
    { key: 'total_leads', label: 'Total Leads' },
    { key: 'appointment_showed', label: 'Appointment Showed' },
    { key: 'total_njm', label: 'Total NJMs' },
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

  // Calculate totals for the displayed data
  const totals = useMemo(() => {
    return locationData.reduce((acc, location) => {
      acc.total_leads += location.total_leads || 0;
      acc.appointment_showed += location.appointment_showed || 0;
      acc.total_njm += location.total_njm || 0;
      return acc;
    }, { total_leads: 0, appointment_showed: 0, total_njm: 0 });
  }, [locationData]);

  if (!isOpen) return null;

  const modalTitle = selectedCountry 
    ? `${selectedCountry} - Club Performance Details`
    : 'Country Club Performance Table';

  const modalDescription = selectedCountry
    ? `Detailed metrics for clubs in ${selectedCountry}`
    : 'Detailed metrics for each country and club';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{modalTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              {modalDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
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
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">{loc.total_leads?.toLocaleString?.() ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">{loc.appointment_showed?.toLocaleString?.() ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">{loc.total_njm?.toLocaleString?.() ?? '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">{typeof loc.lead_to_sale === 'number' ? loc.lead_to_sale.toFixed(2) + '%' : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">{typeof loc.appointment_to_sale === 'number' ? loc.appointment_to_sale.toFixed(2) + '%' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCountry ? locationData.length : countries.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {selectedCountry ? 'Clubs' : 'Countries'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCountry ? locationData.length : locationData.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Clubs</div>
            </div>
            {selectedCountry && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totals.total_leads.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totals.appointment_showed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Appointments</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryTableModal;
