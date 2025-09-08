import React from 'react';

const CountryLeaderboard = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const getRankNumber = (index) => {
    return <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">#{index + 1}</span>;
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Country Performance</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Top performing countries by total leads</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Country</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Leads</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Appointments</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total NJM</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 7).map((country, index) => (
              <tr 
                key={country.country} 
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getRankNumber(index)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {country.country}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {country.total_leads.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {country.appointment_showed.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {country.total_njm.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CountryLeaderboard;
