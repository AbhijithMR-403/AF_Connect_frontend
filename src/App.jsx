import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './hooks';
import { loadDashboardData } from './store/slices/dashboardSlice';
import DashboardHeader from './components/DashboardHeader';
import FilterBar from './components/FilterBar';
import PipelineTabs from './components/PipelineTabs';
import SalesPipeline from './components/SalesPipeline';
import OnboardingPipeline from './components/OnboardingPipeline';
import DefaulterPipeline from './components/DefaulterPipeline';
import RegionalView from './components/RegionalView';
import Login, { Brand } from './components/auth/Login';
import { me, logout } from './services/auth';
import { AUTH_EXPIRED_EVENT, reloadPage } from './services/http';

const DashboardContent = ({ user, onLogout }) => {
  const dispatch = useAppDispatch();

  // Removed duplicate loadClubsAndCountries call - it's now handled in FilterBar

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <DashboardHeader user={user} onLogout={onLogout} />
        <FilterBar />
        <PipelineTabs>
          <SalesPipeline />
          <OnboardingPipeline />
          <DefaulterPipeline />
          <RegionalView />
        </PipelineTabs>
      </div>
    </div>
  );
};

function App() {
  // undefined = checking the session, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setNotice('Session expired, please sign in again.');
      setUser(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center" role="status" aria-label="Loading">
        <Brand />
      </div>
    );
  }

  // Reload after sign-in/out so no dashboard state from a previous user stays in memory.
  if (user === null) return <Login notice={notice} onLoggedIn={reloadPage} />;

  const handleLogout = async () => {
    await logout();
    reloadPage();
  };

  return (
    <Provider store={store}>
      <DashboardContent user={user} onLogout={handleLogout} />
    </Provider>
  );
}

export default App;