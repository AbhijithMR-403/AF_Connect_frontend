import React from 'react';
import { AlertTriangle, MessageCircle, DollarSign, TrendingDown } from 'lucide-react';
import { useAppSelector } from '../hooks';

const DefaulterPipeline = () => {
  const { defaulterMetrics } = useAppSelector((state) => state.dashboard);

  if (!defaulterMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total 1-Month Defaulters',
      value: defaulterMetrics.totalDefaulters,
      description: 'Members in default status (D1)',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
      isPercentage: false,
    },
    {
      title: 'Communications Sent',
      value: defaulterMetrics.communicationsSent,
      description: 'Number of contacts under Calls stage',
      icon: MessageCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      isPercentage: false,
    },
    {
      title: 'Promise to Pay Conversion',
      value: `${defaulterMetrics.ptpConversion}%`,
      description: 'Paid ÷ Total PTP',
      icon: TrendingDown,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      isPercentage: true,
    },
    {
      title: 'Payment Recovery Rate',
      value: `${defaulterMetrics.paymentRecoveryRate}%`,
      description: 'Paid ÷ Total in Default',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      isPercentage: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Defaulter Management Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.isPercentage ? metric.value : typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{metric.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recovery Performance Indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Recovery Performance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current recovery rate vs. target (50%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {defaulterMetrics.paymentRecoveryRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {defaulterMetrics.paymentRecoveryRate >= 50 ? 'Above Target' : 'Below Target'}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(defaulterMetrics.paymentRecoveryRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaulterPipeline;