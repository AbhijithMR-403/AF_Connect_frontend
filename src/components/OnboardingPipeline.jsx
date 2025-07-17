import React, { useState } from 'react';
import { CheckCircle, Users, Smartphone, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../hooks';
import OpportunityModal from './OpportunityModal';
import { generateTabbedOpportunities } from '../utils/mockOpportunityData';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';
import metricTypeConfigs from '../config/metricTypes';

const PAGE_SIZE = 10;

const OnboardingPipeline = () => {
  const { onboardingMetrics, salesMetrics } = useAppSelector((state) => state.dashboard);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
  });
  const [tabbedPages, setTabbedPages] = useState({ agreement: 1, apps: 1, gofast: 1, afresults: 1 });
  const [activeTab, setActiveTab] = useState(0);
  const [modalTabs, setModalTabs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const onboardingTabTypes = [
    { label: 'Membership Agreement', metricType: 'membership-agreement', tabKey: 'agreement' },
    { label: 'Apps', metricType: 'apps', tabKey: 'apps' },
    { label: '15min GoFast', metricType: '15min-gofast', tabKey: 'gofast' },
    { label: 'AF Results', metricType: 'af-results', tabKey: 'afresults' },
  ];

  const onboardingTabTypesMap = {
    'assessment-uptake': [
      { label: '15min GoFast', metricType: '15min-gofast', tabKey: 'gofast' },
      { label: 'Membership Agreement', metricType: 'membership-agreements', tabKey: 'agreement' },
    ],
    'af-results': [
      { label: 'AF Results', metricType: 'af-results', tabKey: 'afresults' },
    ],
    'af-conversion': [
      { label: 'AF Results', metricType: 'af-results', tabKey: 'afresults' },
      { label: '15min GoFast', metricType: '15min-gofast', tabKey: 'gofast' },
    ],
    'app-adoption': [
      { label: 'Apps', metricType: 'apps', tabKey: 'apps' },
      { label: 'Membership Agreement', metricType: 'membership-agreements', tabKey: 'agreement' },
    ],
  };

  const openTabbedModal = async (metricType, title, tabIdx = 0, page = 1) => {
    const tabTypes = onboardingTabTypesMap[metricType];
    setModalData((prev) => ({ ...prev, isOpen: true, title }));
    setModalLoading(true);
    setModalError(null);
    setActiveTab(tabIdx);
    try {
      const results = await Promise.all(tabTypes.map((tab, idx) =>
        fetchOpportunities({ ...metricTypeConfigs[tab.metricType], page: tabbedPages[tab.tabKey] || 1 })
      ));
      setModalTabs(tabTypes.map((tab, idx) => ({
        label: tab.label,
        data: normalizeOpportunitiesResponse(results[idx]),
        totalCount: results[idx].count,
        metricType: tab.metricType,
      })));
      setModalLoading(false);
    } catch (error) {
      setModalError(error.message || 'Failed to fetch opportunities');
      setModalLoading(false);
    }
  };

  const handleTabChange = (tabIdx) => {
    setActiveTab(tabIdx);
  };

  const handleTabPageChange = (tabIdx, page) => {
    const metricType = metrics[metrics.findIndex(m => m.metricType === modalTabs[tabIdx]?.metricType)]?.metricType;
    const tabTypes = onboardingTabTypesMap[metricType] || [];
    const tabKey = tabTypes[tabIdx]?.tabKey;
    setTabbedPages((prev) => ({ ...prev, [tabKey]: page }));
    openTabbedModal(metricType, modalData.title, tabIdx, page);
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      title: '',
    });
    setModalTabs([]);
    setModalLoading(false);
    setModalError(null);
  };

  if (!onboardingMetrics) {
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
      title: 'Assessment Uptake',
      value: `${onboardingMetrics.assessmentUptake}%`,
      description: '15-min Gofast ÷ Membership Agreements',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      metricType: 'assessment-uptake',
    },
    {
      title: 'AF Results',
      value: `${onboardingMetrics.afResults}%`,
      description: 'AF Results completion rate',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      metricType: 'af-results',
    },
    {
      title: 'Conversion Rate',
      value: `${onboardingMetrics.conversionRate}%`,
      description: 'AF Results ÷ 15-min Gofast',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      metricType: 'af-conversion',
    },
    {
      title: 'App Adoption Rate',
      value: `${onboardingMetrics.appAdoptionRate}%`,
      description: 'AF App Downloads ÷ Membership Agreements',
      icon: Smartphone,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      metricType: 'app-adoption',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Member Onboarding Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              onClick={() => openTabbedModal(metric.metricType, `${metric.title} - GHL Opportunities`)}
              className="border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color} group-hover:scale-105 transition-transform`}>
                  {metric.value}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{metric.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{metric.description}</p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        tabs={modalTabs}
        loading={modalLoading}
        error={modalError}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTabPageChange={handleTabPageChange}
        tabbedPages={tabbedPages}
        pageSize={PAGE_SIZE}
        opportunities={[]}
        totalCount={0}
      />
    </div>
  );
};

export default OnboardingPipeline;