import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateActiveSection, loadDashboardData } from '../store/slices/dashboardSlice';

const PipelineTabs = ({ children }) => {
  const dispatch = useAppDispatch();
  const { filters, activeSection } = useAppSelector((state) => state.dashboard);
  const [activeTab, setActiveTab] = useState(activeSection);

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
      color: 'text-blue-600 dark:text-blue-400',
      activeColor: 'bg-blue-600 dark:bg-blue-700',
    },
    {
      id: 2,
      name: 'Defaulter Management',
      shortName: 'Defaulters',
      icon: AlertTriangle,
      color: 'text-blue-600 dark:text-blue-400',
      activeColor: 'bg-blue-600 dark:bg-blue-700',
    },
    {
      id: 3,
      name: '🌍 Regional View',
      shortName: 'Regional',
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400',
      activeColor: 'bg-blue-600 dark:bg-blue-700',
    },
  ];

  // Update local state when Redux state changes
  useEffect(() => {
    if (activeTab !== activeSection) {
      setActiveTab(activeSection);
    }
  }, [activeSection, activeTab]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    // Only proceed if we're actually changing tabs
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    dispatch(updateActiveSection(tabId));
    // Load data for the new section
    if (filters) {
      dispatch(loadDashboardData({ filters, activeSection: tabId }));
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1 sm:p-1.5 lg:p-2 transition-colors duration-200">
        <div className="flex space-x-0.5 sm:space-x-1 lg:space-x-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-1 justify-center ${
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