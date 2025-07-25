import React, { useState } from 'react';
import { TrendingUp, Users, AlertTriangle, Globe } from 'lucide-react';

const PipelineTabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      name: 'Sales Pipeline',
      shortName: 'Sales',
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      activeColor: 'bg-blue-600 dark:bg-blue-700',
    },
    {
      id: 1,
      name: 'Member Onboarding',
      shortName: 'Onboarding',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      activeColor: 'bg-green-600 dark:bg-green-700',
    },
    {
      id: 2,
      name: 'Defaulter Management',
      shortName: 'Defaulters',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      activeColor: 'bg-red-600 dark:bg-red-700',
    },
    {
      id: 3,
      name: '🌍 Regional View',
      shortName: 'Regional',
      icon: Globe,
      color: 'text-purple-600 dark:text-purple-400',
      activeColor: 'bg-purple-600 dark:bg-purple-700',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1 sm:p-2 transition-colors duration-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start ${
                  isActive
                    ? `${tab.activeColor} text-white shadow-sm`
                    : `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300 ease-in-out">
        {children[activeTab]}
      </div>
    </div>
  );
};

export default PipelineTabs;