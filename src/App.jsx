import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './hooks';
import { loadDashboardData, loadClubs } from './store/slices/dashboardSlice';
import DashboardHeader from './components/DashboardHeader';
import FilterBar from './components/FilterBar';
import PipelineTabs from './components/PipelineTabs';
import SalesPipeline from './components/SalesPipeline';
import OnboardingPipeline from './components/OnboardingPipeline';
import DefaulterPipeline from './components/DefaulterPipeline';
import RegionalView from './components/RegionalView';

const DashboardContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load initial data
    dispatch(loadDashboardData({
      country: ['all'],
      club: ['all'],
      assignedUser: ['all'],
      dateRange: 'last-30-days',
      leadSource: 'all',
    }));
    dispatch(loadClubs());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <DashboardHeader />
        <FilterBar />
        <PipelineTabs>
          <SalesPipeline />
          <OnboardingPipeline />
          <DefaulterPipeline />
          <RegionalView />
          <RegionalView />
        </PipelineTabs>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <DashboardContent />
    </Provider>
  );
}

export default App;