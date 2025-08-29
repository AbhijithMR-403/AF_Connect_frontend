import React, { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useAppSelector } from '../hooks';
import CountryPerformanceChart from './charts/CountryPerformanceChart';
import CountryTableModal from './CountryTableModal';

const RegionalView = () => {
  const { locations, countries } = useAppSelector((state) => state.dashboard);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Use locations from API
  const locationData = locations || [];

  // Aggregate data by country
  const chartData = useMemo(() => {
    if (!locationData || locationData.length === 0) return [];
    
    // Group data by country
    const countryGroups = locationData.reduce((acc, location) => {
      const country = location.country;
      if (!acc[country]) {
        acc[country] = {
          country: country,
          total_leads: 0,
          appointment_showed: 0,
          total_njm: 0,
          clubs: []
        };
      }
      
      acc[country].total_leads += location.total_leads || 0;
      acc[country].appointment_showed += location.appointment_showed || 0;
      acc[country].total_njm += location.total_njm || 0;
      acc[country].clubs.push(location);
      
      return acc;
    }, {});

    // Convert to array and sort by total leads
    return Object.values(countryGroups).sort((a, b) => b.total_leads - a.total_leads);
  }, [locationData]);

  // Filter location data by selected country
  const filteredLocationData = useMemo(() => {
    if (!selectedCountry) return locationData;
    return locationData.filter(location => location.country === selectedCountry);
  }, [locationData, selectedCountry]);

  // Handle country click to open modal
  const handleCountryClick = (data) => {
    if (data && data.country) {
      setSelectedCountry(data.country);
    } else {
      setSelectedCountry(null); // View all countries
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
  };

  // Check for loading state
  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regional View</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Country performance overview with interactive charts</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <CountryPerformanceChart 
        data={chartData} 
        onCountryClick={handleCountryClick}
      />

      {/* Country Table Modal */}
      <CountryTableModal
        isOpen={isModalOpen}
        onClose={closeModal}
        locationData={filteredLocationData}
        countries={countries}
        selectedCountry={selectedCountry}
      />
    </div>
  );
};

export default RegionalView;
