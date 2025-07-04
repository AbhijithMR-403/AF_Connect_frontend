import React, { useState } from 'react';
import { ChevronDown, X, Check, Calendar } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateFilters } from '../store/slices/dashboardSlice';

const FilterBar = () => {
  const dispatch = useAppDispatch();
  const { filters, countries, clubs } = useAppSelector((state) => state.dashboard);
  
  // State for dropdown visibility
  const [dropdownStates, setDropdownStates] = useState({
    country: false,
    club: false,
    assignedUser: false,
    dateRange: false,
  });

  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
    isOpen: false,
  });

  const toggleDropdown = (filterType) => {
    setDropdownStates(prev => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const closeDropdown = (filterType) => {
    setDropdownStates(prev => ({
      ...prev,
      [filterType]: false,
    }));
  };

  const handleMultiSelectChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    let newValues;
    
    if (value === 'all') {
      newValues = ['all'];
    } else {
      // Remove 'all' if it exists and we're selecting specific items
      const filteredValues = currentValues.filter(v => v !== 'all');
      
      if (filteredValues.includes(value)) {
        newValues = filteredValues.filter(v => v !== value);
        // If no items selected, default to 'all'
        if (newValues.length === 0) {
          newValues = ['all'];
        }
      } else {
        newValues = [...filteredValues, value];
      }
    }
    
    dispatch(updateFilters({ [filterType]: newValues }));
  };

  const handleSingleSelectChange = (filterType, value) => {
    if (value === 'custom-range') {
      setCustomDateRange(prev => ({ ...prev, isOpen: true }));
    } else {
      dispatch(updateFilters({ [filterType]: value }));
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      dispatch(updateFilters({ 
        dateRange: 'custom-range',
        customStartDate: customDateRange.startDate,
        customEndDate: customDateRange.endDate,
      }));
      setCustomDateRange(prev => ({ ...prev, isOpen: false }));
    }
  };

  const removeFilter = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.filter(v => v !== value);
    
    if (newValues.length === 0) {
      dispatch(updateFilters({ [filterType]: ['all'] }));
    } else {
      dispatch(updateFilters({ [filterType]: newValues }));
    }
  };

  const MultiSelectDropdown = ({ label, filterType, options, selectedValues = [] }) => {
    const isOpen = dropdownStates[filterType];
    
    return (
      <div className="relative">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
        
        {/* Selected items display */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
          {selectedValues.includes('all') ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              All {label}
            </span>
          ) : selectedValues.length > 0 ? (
            selectedValues.map(value => {
              const option = options.find(opt => opt.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(filterType, value);
                    }}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">No {label.toLowerCase()} selected</span>
          )}
        </div>
        
        {/* Dropdown button */}
        <button
          onClick={() => toggleDropdown(filterType)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <span className="text-gray-700 dark:text-gray-300">Select {label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => closeDropdown(filterType)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelectChange(filterType, option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const DateRangeDropdown = ({ label, value, options, onChange }) => {
    const isOpen = dropdownStates.dateRange;
    
    const getDisplayValue = () => {
      if (value === 'custom-range' && filters.customStartDate && filters.customEndDate) {
        return `${filters.customStartDate} to ${filters.customEndDate}`;
      }
      const option = options.find(opt => opt.value === value);
      return option ? option.label : 'Select date range';
    };

    return (
      <div className="relative">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
        
        {/* Current selection display */}
        <div className="mb-2 min-h-[24px]">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {getDisplayValue()}
          </span>
        </div>
        
        {/* Dropdown button */}
        <button
          onClick={() => toggleDropdown('dateRange')}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <span className="text-gray-700 dark:text-gray-300">Change Date Range</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => closeDropdown('dateRange')}
            />
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    closeDropdown('dateRange');
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    value === option.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const SingleSelectDropdown = ({ label, value, options, onChange }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full min-w-0 text-gray-700 dark:text-gray-300"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
    </div>
  );

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    ...countries.map((country) => ({
      value: country.id,
      label: `${country.flag} ${country.name}`,
    })),
  ];

  const clubOptions = [
    { value: 'all', label: 'All Clubs' },
    ...clubs.map((club) => ({
      value: club.id,
      label: club.name,
    })),
  ];

  const assignedUserOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'john-smith', label: 'John Smith' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'lisa-rodriguez', label: 'Lisa Rodriguez' },
    { value: 'david-kim', label: 'David Kim' },
    { value: 'emma-wilson', label: 'Emma Wilson' },
    { value: 'alex-brown', label: 'Alex Brown' },
    { value: 'maria-garcia', label: 'Maria Garcia' },
    { value: 'james-taylor', label: 'James Taylor' },
    { value: 'anna-lee', label: 'Anna Lee' },
  ];

  const dateRangeOptions = [
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'last-year', label: 'Last year' },
    { value: 'custom-range', label: 'Custom Range' },
  ];

  const leadSourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'google-ads', label: 'Google Ads' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'referral', label: 'Referral' },
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <MultiSelectDropdown
            label="Countries"
            filterType="country"
            options={countryOptions}
            selectedValues={Array.isArray(filters.country) ? filters.country : [filters.country]}
          />
          
          <MultiSelectDropdown
            label="Clubs"
            filterType="club"
            options={clubOptions}
            selectedValues={Array.isArray(filters.club) ? filters.club : [filters.club]}
          />
          
          <MultiSelectDropdown
            label="Assigned Users"
            filterType="assignedUser"
            options={assignedUserOptions}
            selectedValues={Array.isArray(filters.assignedUser) ? filters.assignedUser : [filters.assignedUser || 'all']}
          />
          
          <DateRangeDropdown
            label="Date Range"
            value={filters.dateRange}
            options={dateRangeOptions}
            onChange={(value) => handleSingleSelectChange('dateRange', value)}
          />
          
          <SingleSelectDropdown
            label="Lead Source"
            value={filters.leadSource}
            options={leadSourceOptions}
            onChange={(value) => handleSingleSelectChange('leadSource', value)}
          />
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {customDateRange.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Custom Date Range
              </h3>
              <button
                onClick={() => setCustomDateRange(prev => ({ ...prev, isOpen: false }))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  min={customDateRange.startDate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCustomDateRange(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateSubmit}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterBar;