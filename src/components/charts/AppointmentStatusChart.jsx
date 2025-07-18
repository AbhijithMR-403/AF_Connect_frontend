import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const AppointmentStatusChart = ({ appointmentStatus, openModal }) => {
  const handlePieClick = (data) => {
    openModal('appointment-status', `${data.status} Appointments - GHL Opportunities`, data.count, data);
  };  
  // Define PieTooltip internally
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{`${data.status || data.name}: ${data.count || data.value}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{`${data.percentage}%`}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to view opportunities</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Appointment Status</h3>
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {appointmentStatus.map((status, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            onClick={() => handlePieClick(status)}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{status.status}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {status.count.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{status.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-48 sm:h-64 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {appointmentStatus.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={1}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={appointmentStatus}
              cx="50%"
              cy="50%"
              outerRadius={window.innerWidth < 640 ? 60 : 80}
              innerRadius={window.innerWidth < 640 ? 25 : 35}
              dataKey="count"
              labelLine={false}
              onClick={handlePieClick}
              cursor="pointer"
            >
              {appointmentStatus.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pieGradient-${index})`}
                  stroke="#ffffff"
                  strokeWidth={2}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentStatusChart; 