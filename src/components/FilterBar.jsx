import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check, Calendar, Filter } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateFilters, loadUsers, loadClubsAndCountries, loadDashboardData, loadValidLeadSources, loadPipelineNames } from '../store/slices/dashboardSlice';
import { store } from '../store';

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
  const { filters, countries, clubs, users, usersLoading, usersError, clubsLoading, clubsError, validLeadSources, validLeadSourcesLoading, validLeadSourcesError, pipelines, pipelinesLoading, pipelinesError, isInitialized, loading } = useAppSelector((state) => state.dashboard);
  
  // State for dropdown visibility
  const [dropdownStates, setDropdownStates] = useState({
    country: false,
    club: false,
    assignedUser: false,
    dateRange: false,
    leadSource: false,
    pipeline: false,
  });

  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
    isOpen: false,
  });

  // State for pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState({});
  
  // State for local loading indicator
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  // Fetch users and both clubs and countries on component mount
  useEffect(() => {
    dispatch(loadUsers());
    dispatch(loadClubsAndCountries());
    dispatch(loadValidLeadSources());
    dispatch(loadPipelineNames());
  }, [dispatch]);

  // Initialize pending filters with current filters and keep them in sync
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // Load initial dashboard data when filter data is available
  useEffect(() => {
    // Only load dashboard data if we have the required filter data and no dashboard data yet
    const { salesMetrics, onboardingMetrics, defaulterMetrics, locations } = store.getState().dashboard;
    const hasNoData = !salesMetrics && !onboardingMetrics && !defaulterMetrics && locations.length === 0;
    
    if (!isInitialized && hasNoData && !usersLoading && !clubsLoading && !validLeadSourcesLoading) {
      const { activeSection } = store.getState().dashboard;
      console.log('🎯 FilterBar: Loading initial dashboard data', { activeSection, isInitialized });
      dispatch(loadDashboardData({ filters, activeSection }));
    }
  }, [isInitialized, usersLoading, clubsLoading, validLeadSourcesLoading, dispatch, filters]);

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
    const currentValues = pendingFilters[filterType] || [];
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
    
    setPendingFilters(prev => ({ ...prev, [filterType]: newValues }));
  };

  const handleSingleSelectChange = (filterType, value) => {
    if (value === 'custom-range') {
      setCustomDateRange(prev => ({ ...prev, isOpen: true }));
    } else {
      // For predefined ranges, just update the pending filters
      setPendingFilters(prev => ({ 
        ...prev,
        [filterType]: value,
        // Clear custom dates when using predefined ranges
        customStartDate: null,
        customEndDate: null,
      }));
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setPendingFilters(prev => ({ 
        ...prev,
        dateRange: 'custom-range',
        customStartDate: customDateRange.startDate,
        customEndDate: customDateRange.endDate,
      }));
      setCustomDateRange(prev => ({ ...prev, isOpen: false }));
    }
  };

  const removeFilter = (filterType, value) => {
    const currentValues = pendingFilters[filterType] || [];
    const newValues = currentValues.filter(v => v !== value);
    
    if (newValues.length === 0) {
      setPendingFilters(prev => ({ ...prev, [filterType]: ['all'] }));
    } else {
      setPendingFilters(prev => ({ ...prev, [filterType]: newValues }));
    }
  };

  const applyFilters = async () => {
    // Convert selected pipeline categories to their actual pipeline values for API call
    let pipelineValues = ['all'];
    if (Array.isArray(pendingFilters.pipeline) && !pendingFilters.pipeline.includes('all')) {
      const selectedCategories = pendingFilters.pipeline;
      const allPipelineValues = [];
      
      selectedCategories.forEach(category => {
        const categoryData = pipelines[category];
        if (categoryData && Array.isArray(categoryData)) {
          allPipelineValues.push(...categoryData);
        }
      });
      
      if (allPipelineValues.length > 0) {
        pipelineValues = allPipelineValues;
      }
    }
    
    // Validate filters before applying
    const validatedFilters = {
      country: Array.isArray(pendingFilters.country) ? pendingFilters.country : ['all'],
      club: Array.isArray(pendingFilters.club) ? pendingFilters.club : ['all'],
      assignedUser: Array.isArray(pendingFilters.assignedUser) ? pendingFilters.assignedUser : ['all'],
      dateRange: pendingFilters.dateRange || 'last-30-days',
      leadSource: Array.isArray(pendingFilters.leadSource) ? pendingFilters.leadSource : ['all'],
      pipeline: pendingFilters.pipeline, // Keep original category selections for display
      customStartDate: pendingFilters.customStartDate || null,
      customEndDate: pendingFilters.customEndDate || null,
    };

    console.log('🔧 Applying filters:', validatedFilters);
    
    // Additional validation
    const validationErrors = [];
    if (!validatedFilters.country || validatedFilters.country.length === 0) {
      validationErrors.push('Country filter is required');
    }
    if (!validatedFilters.club || validatedFilters.club.length === 0) {
      validationErrors.push('Club filter is required');
    }
    if (!validatedFilters.assignedUser || validatedFilters.assignedUser.length === 0) {
      validationErrors.push('Assigned User filter is required');
    }
    if (!validatedFilters.dateRange) {
      validationErrors.push('Date range is required');
    }
    if (!validatedFilters.leadSource || validatedFilters.leadSource.length === 0) {
      validationErrors.push('Lead Source filter is required');
    }
    if (!validatedFilters.pipeline || validatedFilters.pipeline.length === 0) {
      validationErrors.push('Pipeline filter is required');
    }
    
    if (validationErrors.length > 0) {
      console.error('❌ Filter validation errors:', validationErrors);
      alert(`Filter validation errors:\n${validationErrors.join('\n')}`);
      return;
    }
    
    setIsApplyingFilters(true);
    
    try {
      // Update Redux state with original category selections (for display)
      dispatch(updateFilters(validatedFilters));
      
      // Create API filters with converted pipeline values
      const apiFilters = {
        ...validatedFilters,
        pipeline: pipelineValues, // Use converted pipeline values for API calls
      };
      
      const { activeSection } = store.getState().dashboard;
      await dispatch(loadDashboardData({ filters: apiFilters, activeSection })).unwrap();
      console.log('✅ Filters applied successfully');
    } catch (error) {
      console.error('❌ Error applying filters:', error);
      alert(`Error applying filters: ${error.message || 'Unknown error'}`);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  const resetFilters = async () => {
    const defaultFilters = {
      country: ['all'],
      club: ['all'],
      assignedUser: ['all'],
      dateRange: 'last-30-days',
      leadSource: ['all'],
      pipeline: ['all'],
      customStartDate: null,
      customEndDate: null,
    };
    setPendingFilters(defaultFilters);
    
    // Apply the reset filters immediately
    setIsApplyingFilters(true);
    
    try {
      // Update Redux state with original category selections (for display)
      dispatch(updateFilters(defaultFilters));
      
      // Create API filters with converted pipeline values (for reset, this is still 'all')
      const apiFilters = {
        ...defaultFilters,
        pipeline: ['all'], // Reset always uses 'all'
      };
      
      const { activeSection } = store.getState().dashboard;
      await dispatch(loadDashboardData({ filters: apiFilters, activeSection })).unwrap();
      console.log('✅ Filters reset and applied successfully');
    } catch (error) {
      console.error('❌ Error resetting filters:', error);
      alert(`Error resetting filters: ${error.message || 'Unknown error'}`);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // Check if filters have changed
  const hasFilterChanges = JSON.stringify(pendingFilters) !== JSON.stringify(filters);

  // Helper function to get singular form of labels
  const getSingularForm = (label) => {
    const singularMap = {
      'Country': 'Country',
      'Clubs': 'Club',
      'Assigned Users': 'Assigned User',
      'Source': 'Source',
      'Pipeline': 'Pipeline'
    };
    return singularMap[label] || label;
  };

  // Helper function to get plural form of labels
  const getPluralForm = (label) => {
    const pluralMap = {
      'Country': 'Countries',
      'Club': 'Clubs',
      'Assigned User': 'Assigned Users',
      'Source': 'Sources',
      'Pipeline': 'Pipelines'
    };
    return pluralMap[label] || label;
  };

  const MultiSelectDropdown = ({ label, filterType, options, selectedValues = [], isLoading = false, error = null }) => {
    const isOpen = dropdownStates[filterType];
    const [searchTerm, setSearchTerm] = useState('');
    
    // Special handling for clubs dropdown to show selected clubs from different countries
    let filteredOptions = options;
    if (filterType === 'club') {
      // Get selected clubs that might not be in the current filtered options
      const selectedClubsNotInOptions = selectedValues.filter(value => 
        value !== 'all' && !options.some(option => option.value === value)
      );
      
      // If we have selected clubs not in current options, add them with special styling
      if (selectedClubsNotInOptions.length > 0) {
        const selectedClubsData = selectedClubsNotInOptions.map(clubId => {
          const club = clubs.find(c => c.id === clubId);
          return {
            value: clubId,
            label: club ? club.name : `Club ${clubId}`,
            isFromDifferentCountry: true,
            countryName: club ? club.countryDisplay : 'Unknown Country'
          };
        });
        
        // Combine selected clubs from different countries with current options
        filteredOptions = [...selectedClubsData, ...options];
      }
    }
    
    // Filter options based on search term and sort with "All" first, then selected options
    filteredOptions = filteredOptions
      .filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // "All" options should always come first
        const aIsAll = a.label.toLowerCase().startsWith('all');
        const bIsAll = b.label.toLowerCase().startsWith('all');
        
        if (aIsAll && !bIsAll) return -1;
        if (!aIsAll && bIsAll) return 1;
        
        // If both are "All" options or both are not "All" options, selected options come next
        const aIsSelected = selectedValues.includes(a.value);
        const bIsSelected = selectedValues.includes(b.value);
        
        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;
        
        // If both are selected or both are not selected, sort alphabetically
        return a.label.localeCompare(b.label);
      });
    
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
        
        {/* Selected items count display BELOW the dropdown button */}
        <div className="flex flex-wrap gap-1 mt-2 min-h-[24px]">
          {error ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              Error loading {label.toLowerCase()}
            </span>
          ) : selectedValues.includes('all') ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              All {getPluralForm(getSingularForm(label))}
            </span>
          ) : selectedValues.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {selectedValues.length} {selectedValues.length === 1 ? getSingularForm(label) : getPluralForm(getSingularForm(label))} selected
            </span>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">No {label.toLowerCase()} selected</span>
          )}
        </div>


        
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
                        const isFromDifferentCountry = option.isFromDifferentCountry;
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleMultiSelectChange(filterType, option.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              isSelected 
                                ? isFromDifferentCountry 
                                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-l-2 border-orange-400' 
                                  : 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : isFromDifferentCountry
                                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-l-2 border-orange-300'
                                  : 'text-gray-700 dark:text-gray-300'
                            }`}
                            title={isFromDifferentCountry ? `This club is from ${option.countryName} (not in currently selected countries)` : option.label}
                          >
                            <div className="flex items-center flex-1 text-left">
                              <span className="truncate" title={option.label}>{option.label}</span>
                              {isFromDifferentCountry && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded border border-orange-200 dark:border-orange-700">
                                  {option.countryName}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <Check className={`w-4 h-4 flex-shrink-0 ml-2 ${
                                isFromDifferentCountry 
                                  ? 'text-orange-600 dark:text-orange-400' 
                                  : 'text-blue-600 dark:text-blue-400'
                              }`} />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Warning message for clubs from different countries */}
                  {filterType === 'club' && selectedValues.some(value => {
                    if (value === 'all') return false;
                    const club = clubs.find(c => c.id === value);
                    return club && selectedCountryNames && !selectedCountryNames.includes(club.countryDisplay);
                  }) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 p-2 bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-start gap-2 text-xs text-orange-700 dark:text-orange-300">
                        <div className="w-4 h-4 mt-0.5 flex-shrink-0">⚠️</div>
                                                 <div>
                           <p className="font-medium">Cross-country clubs selected</p>
                           <p className="text-orange-600 dark:text-orange-400 mt-0.5">
                             These clubs will be included in your results.
                           </p>
                         </div>
                      </div>
                    </div>
                  )}
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
      if (value === 'custom-range' && pendingFilters.customStartDate && pendingFilters.customEndDate) {
        return `${pendingFilters.customStartDate} to ${pendingFilters.customEndDate}`;
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
    pendingFilters.country && !pendingFilters.country.includes('all')
      ? pendingFilters.country.map(c => countryIdToName[c.toLowerCase()]).filter(Boolean)
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
      ? validLeadSources.map(source => ({
          value: source,
          label: source
        }))
      : []),
  ];

  // Process pipeline data to show keys (categories) to user but use values for filtering
  const pipelineOptions = [
    { value: 'all', label: 'All Pipelines' },
    ...(pipelines && typeof pipelines === 'object' && !Array.isArray(pipelines)
      ? Object.entries(pipelines)
          .filter(([key, value]) => Array.isArray(value) && value.length > 0)
          .map(([key, value]) => ({
            value: key, // Use the key as the value for the dropdown
            label: key, // Display the key to the user
            pipelineValues: value // The array of pipeline names for this category
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MultiSelectDropdown
            label="Country"
            filterType="country"
            options={countryOptions}
            selectedValues={Array.isArray(pendingFilters.country) ? pendingFilters.country : [pendingFilters.country]}
          />
          
          <MultiSelectDropdown
            label="Clubs"
            filterType="club"
            options={clubOptions}
            selectedValues={Array.isArray(pendingFilters.club) ? pendingFilters.club : [pendingFilters.club]}
            isLoading={clubsLoading}
            error={clubsError}
          />
          
          <MultiSelectDropdown
            label="Assigned Users"
            filterType="assignedUser"
            options={assignedUserOptions}
            selectedValues={Array.isArray(pendingFilters.assignedUser) ? pendingFilters.assignedUser : [pendingFilters.assignedUser || 'all']}
            isLoading={usersLoading}
            error={usersError}
          />
          
          <DateRangeDropdown
            label="Date Range"
            value={pendingFilters.dateRange}
            options={dateRangeOptions}
            onChange={(value) => handleSingleSelectChange('dateRange', value)}
          />
          
          <MultiSelectDropdown
            label="Source"
            filterType="leadSource"
            options={leadSourceOptions}
            selectedValues={Array.isArray(pendingFilters.leadSource) ? pendingFilters.leadSource : [pendingFilters.leadSource || 'all']}
            isLoading={validLeadSourcesLoading}
            error={validLeadSourcesError}
          />

          <MultiSelectDropdown
            label="Pipeline"
            filterType="pipeline"
            options={pipelineOptions}
            selectedValues={Array.isArray(pendingFilters.pipeline) ? pendingFilters.pipeline : [pendingFilters.pipeline || 'all']}
            isLoading={pipelinesLoading}
            error={pipelinesError}
          />
        </div>

        {/* Filter Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={applyFilters}
            disabled={!hasFilterChanges || isApplyingFilters || loading}
            className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplyingFilters || loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isApplyingFilters ? 'Applying...' : 'Loading...'}
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </>
            )}
          </button>
          <button
            onClick={resetFilters}
            disabled={isApplyingFilters || loading}
            className="ml-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Filters
          </button>
        </div>
        
        {/* Loading indicator */}
        {(isApplyingFilters || loading) && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              {isApplyingFilters ? 'Applying filters and loading data...' : 'Loading dashboard data...'}
            </div>
          </div>
        )}
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