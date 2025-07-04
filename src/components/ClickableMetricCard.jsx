import React from 'react';

const ClickableMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBgColor,
  onClick,
}) => {
  const formatChange = (change) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'text-green-600 dark:text-green-400' : change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {title}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors leading-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {change !== undefined && (
              <span className={`text-xs sm:text-sm font-medium ${getChangeColor(change)}`}>
                {formatChange(change)}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view opportunities
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform flex-shrink-0 ml-2 sm:ml-4`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default ClickableMetricCard;