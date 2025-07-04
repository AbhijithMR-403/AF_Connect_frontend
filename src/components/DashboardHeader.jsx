import React, { useState, useEffect } from 'react';
import { Activity, Download, FileText, RefreshCw, Moon, Sun } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { loadDashboardData } from '../store/slices/dashboardSlice';

const DashboardHeader = () => {
  const dispatch = useAppDispatch();
  const { loading, lastUpdated, filters } = useAppSelector((state) => state.dashboard);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRefresh = () => {
    dispatch(loadDashboardData(filters));
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Logo and Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo 1.png" 
              alt="AF Connect" 
              className="h-12 sm:h-16 md:h-20 w-auto object-contain"
            />
          </div>
          
          {/* Title and Description */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 leading-tight">
              Macro Report Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Regional reporting across 119 clubs in 6 countries
            </p>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
          {/* Real-time indicator */}
          <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-full order-last sm:order-first">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 whitespace-nowrap">Real-time Data</span>
          </div>

          {/* Export and Refresh buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs lg:text-sm"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                  <span className="hidden lg:inline font-medium text-gray-700 dark:text-gray-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 flex-shrink-0 text-gray-600" />
                  <span className="hidden lg:inline font-medium text-gray-700">Dark</span>
                </>
              )}
            </button>

            {/* Export buttons - hidden on mobile, shown as dropdown on small screens */}
            <div className="hidden sm:flex gap-2">
              <button className="flex items-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs lg:text-sm">
                <Download className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                <span className="hidden lg:inline font-medium text-gray-700 dark:text-gray-300">Export CSV</span>
                <span className="lg:hidden font-medium text-gray-700 dark:text-gray-300">CSV</span>
              </button>

              <button className="flex items-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs lg:text-sm">
                <FileText className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                <span className="hidden lg:inline font-medium text-gray-700 dark:text-gray-300">Export PDF</span>
                <span className="lg:hidden font-medium text-gray-700 dark:text-gray-300">PDF</span>
              </button>
            </div>

            {/* Mobile export dropdown */}
            <div className="sm:hidden">
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option value="">Export Options</option>
                <option value="csv">Export CSV</option>
                <option value="pdf">Export PDF</option>
              </select>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs lg:text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 flex-shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Last updated:</span>
            </div>
            <span className="sm:ml-1">{formatLastUpdated(lastUpdated)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;