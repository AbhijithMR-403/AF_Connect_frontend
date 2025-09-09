import React from 'react';
import { X, MapPin, Users, Calendar, Target } from 'lucide-react';

const LocationWiseModal = ({ isOpen, onClose, data, loading, error }) => {
  if (!isOpen) return null;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Location-wise Opportunity Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Performance metrics by location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading location data...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 mb-2">Error loading data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
              </div>
            </div>
          )}

          {!loading && !error && data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Country
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Total Opportunities
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Total Appointments
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Total NJMs
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      NJM Online
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      NJM Offline
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((location, index) => {
                    return (
                      <tr 
                        key={location.location_id || index}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {location.location_name || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            {location.country_display || location.country_code || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(location.total_opps)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(location.total_appointments)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(location.njms_total)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(location.njm_online)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(location.njm_offline)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (!data || data.length === 0) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600 dark:text-gray-400">No location data available</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data && data.length > 0 && (
              <span>Showing {data.length} location{data.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationWiseModal;
