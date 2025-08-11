import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Check, Calendar } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateFilters, loadUsers, loadClubsAndCountries, loadDashboardData, loadValidLeadSources } from '../store/slices/dashboardSlice';

// Custom styles to hide scrollbars
const dropdownStyles = `
  .dropdown-menu::-webkit-scrollbar {
    display: none;
  }
  
  .dropdown-menu {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .dropdown-options::-webkit-scrollbar {
    display: none;
  }
  
  .dropdown-options {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const FilterBar = () => {
  const dispatch = useAppDispatch();
  const { filters, countries, clubs, users, usersLoading, usersError, clubsLoading, clubsError, validLeadSources, validLeadSourcesLoading, validLeadSourcesError } = useAppSelector((state) => state.dashboard);
  
  // State for dropdown visibility
  const [dropdownStates, setDropdownStates] = useState({
    country: false,
    club: false,
    assignedUser: false,
    dateRange: false,
    leadSource: false,
  });

  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
    isOpen: false,
  });

  // Fetch users and both clubs and countries on component mount
  useEffect(() => {
    dispatch(loadUsers());
    dispatch(loadClubsAndCountries());
    dispatch(loadValidLeadSources());
  }, [dispatch]);



  // Call generateDashboardData API whenever filters change
  useEffect(() => {
    if (filters) {
      dispatch(loadDashboardData(filters));
    }
  }, [filters, dispatch]);

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
      // For predefined ranges, just update the dateRange - the slice will handle the calculation
      dispatch(updateFilters({ 
        [filterType]: value,
        // Clear custom dates when using predefined ranges
        customStartDate: null,
        customEndDate: null,
      }));
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

  const MultiSelectDropdown = ({ label, filterType, options, selectedValues = [], isLoading = false, error = null }) => {
    const isOpen = dropdownStates[filterType];
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Method 1: Simple truncation (current approach)
    const renderSimpleTruncation = (text) => (
      <span className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] text-xs">{text}</span>
    );

    // Method 2: Tooltip with full text on hover
    const renderWithTooltip = (text) => (
      <span 
        className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] cursor-help text-xs" 
        title={text}
      >
        {text}
      </span>
    );

    // Method 3: Responsive text sizing
    const renderResponsiveText = (text) => (
      <span className="truncate text-xs sm:text-xs lg:text-xs max-w-[100px] sm:max-w-[120px] lg:max-w-[140px]">
        {text}
      </span>
    );

    // Method 4: Multi-line with max height
    const renderMultiLine = (text) => (
      <span className="line-clamp-2 text-xs leading-tight max-w-[100px] sm:max-w-[120px] lg:max-w-[140px]">
        {text}
      </span>
    );

    // Method 5: Dynamic width based on container
    const renderDynamicWidth = (text) => (
      <span className="truncate w-full max-w-none">
        {text}
      </span>
    );

    // Choose which method to use (you can change this)
    const renderText = renderWithTooltip; // Change this to try different methods
    
    // Clear search when dropdown closes
    useEffect(() => {
      if (!isOpen) {
        setSearchTerm('');
      }
    }, [isOpen]);
    
    return (
      <div className="relative">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
        
        {/* Dropdown button */}
        <button
          onClick={() => toggleDropdown(filterType)}
          disabled={isLoading}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-gray-700 dark:text-gray-300 truncate">
            {isLoading ? `Loading ${label}...` : `Select ${label}`}
          </span>
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>
        
        {/* Selected items display BELOW the dropdown button */}
        <div className="flex flex-wrap gap-1 mt-2 min-h-[24px]">
          {error ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              Error loading {label.toLowerCase()}
            </span>
          ) : selectedValues.includes('all') ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              All {label}
            </span>
          ) : selectedValues.length > 0 ? (
            selectedValues.map(value => {
              const option = options.find(opt => opt.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 max-w-full">
                  {renderText(option.label)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(filterType, value);
                    }}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 flex-shrink-0"
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

        {/* Alternative: Grid layout for selected items (uncomment to use) */}
        {/* 
        <div className="grid grid-cols-3 gap-1 mt-2 min-h-[24px] max-h-[80px] overflow-y-auto">
          {error ? (
            <span className="col-span-3 inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              Error loading {label.toLowerCase()}
            </span>
          ) : selectedValues.includes('all') ? (
            <span className="col-span-3 inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              All {label}
            </span>
          ) : selectedValues.length > 0 ? (
            selectedValues.map(value => {
              const option = options.find(opt => opt.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-full">
                  <span className="truncate">{option.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(filterType, value);
                    }}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })
          ) : (
            <span className="col-span-3 text-xs text-gray-500 dark:text-gray-400">No {label.toLowerCase()} selected</span>
          )}
        </div>
        */}
        
        {/* Dropdown menu */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => closeDropdown(filterType)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto dropdown-menu">
              {isLoading ? (
                <div className="flex items-center justify-center px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : error ? (
                <div className="px-3 py-4 text-sm text-red-600 dark:text-red-400">
                  Failed to load {label.toLowerCase()}. Please try again.
                </div>
              ) : (
                <>
                  {/* Search input */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 p-2">
                    <input
                      type="text"
                      placeholder={`Search ${label.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* Options list */}
                  <div className="max-h-48 overflow-y-auto dropdown-options">
                    {filteredOptions.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No {label.toLowerCase()} found matching "{searchTerm}"
                      </div>
                    ) : (
                      filteredOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleMultiSelectChange(filterType, option.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="truncate flex-1 text-left" title={option.label}>{option.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
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
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
        
        {/* Dropdown button */}
        <button
          onClick={() => toggleDropdown('dateRange')}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <span className="text-gray-700 dark:text-gray-300 truncate">Change Date Range</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Current selection display BELOW the dropdown button */}
        <div className="mt-2 min-h-[24px]">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 max-w-full">
            <span className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px]">{getDisplayValue()}</span>
          </span>
        </div>
        
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
                  className={`w-full flex items-center px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    value === option.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="truncate flex-1 text-left" title={option.label}>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };


  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    ...countries.map((country) => ({
      value: country.id,
      label: country.name,
    })),
  ];

  // Map country code to display name for filtering
  const countryIdToName = Object.fromEntries(countries.map(c => [c.id.toLowerCase(), c.name]));
  const selectedCountryNames =
    filters.country && !filters.country.includes('all')
      ? filters.country.map(c => countryIdToName[c.toLowerCase()]).filter(Boolean)
      : null;

  const clubOptions = [
    { value: 'all', label: 'All Clubs' },
    ...clubs
      .filter(club => {
        if (!selectedCountryNames) return true; // 'all' selected, show all
        return selectedCountryNames.includes(club.countryDisplay);
      })
      .map(club => ({
        value: club.id,
        label: club.name,
      })),
  ];

  const assignedUserOptions = [
    { value: 'all', label: 'All Users' },
    ...(usersLoading ? [] : users.map(user => ({
      value: user.id || user._id,
      label: `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || user.email || 'Unknown User',
    }))),
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
    ...(Array.isArray(validLeadSources) && validLeadSources.length > 0
      ? validLeadSources
      : []),
  ];

  return (
    <>
      <style>{dropdownStyles}</style>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 lg:p-5 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
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
            isLoading={clubsLoading}
            error={clubsError}
          />
          
          <MultiSelectDropdown
            label="Assigned Users"
            filterType="assignedUser"
            options={assignedUserOptions}
            selectedValues={Array.isArray(filters.assignedUser) ? filters.assignedUser : [filters.assignedUser || 'all']}
            isLoading={usersLoading}
            error={usersError}
          />
          
          <DateRangeDropdown
            label="Date Range"
            value={filters.dateRange}
            options={dateRangeOptions}
            onChange={(value) => handleSingleSelectChange('dateRange', value)}
          />
          
          {/* Change Lead Source to MultiSelectDropdown */}
          <MultiSelectDropdown
            label="Lead Source"
            filterType="leadSource"
            options={leadSourceOptions}
            selectedValues={Array.isArray(filters.leadSource) ? filters.leadSource : [filters.leadSource || 'all']}
            isLoading={validLeadSourcesLoading}
            error={validLeadSourcesError}
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