import React from 'react';

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBgColor,
}) => {
  const formatChange = (change) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {change !== undefined && (
              <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                {formatChange(change)}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;