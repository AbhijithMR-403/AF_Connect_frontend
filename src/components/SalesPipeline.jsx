import React, { useState, useEffect } from 'react';
import { Users, Calendar, Target, FileText, TrendingUp, AlertCircle, BarChart3, Phone, Eye } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { selectProcessedFilters, loadBreakdownData } from '../store/slices/dashboardSlice';
import ClickableMetricCard from './ClickableMetricCard';
import ChartSection from './ChartSection';
import TrendGraphs from './TrendGraphs';
import OpportunityModal from './OpportunityModal';
import NJMAnalysis from './NJMAnalysis';
import { fetchOpportunities, normalizeOpportunitiesResponse } from '../services/api';
import metricTypeConfigs from '../config/metricTypes';

const PAGE_SIZE = 10;

const SalesPipeline = () => {
  const dispatch = useAppDispatch();
  const { salesMetrics, countries, loading, validLeadSources } = useAppSelector((state) => state.dashboard);
  const filters = useAppSelector(selectProcessedFilters);

  // Helper function to simplify ratios
  const simplifyRatio = (numerator, denominator) => {
    if (denominator === 0) return '0:0';
    if (numerator === 0) return '0:1';
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
    const simplifiedNum = numerator / divisor;
    const simplifiedDen = denominator / divisor;
    
    return `${simplifiedNum}:${simplifiedDen}`;
  };


  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    opportunities: [],
    totalCount: 0,
    loading: false,
    error: null,
    metricType: '', // <-- add this
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [tabbedPages, setTabbedPages] = useState({ online: 1, offline: 1, njm: 1, lead: 1, appointment: 1 });
  const [activeTab, setActiveTab] = useState(0);

  // Helper to convert lead source keys to values
  const convertLeadSourceKeysToValues = (leadSourceKeys) => {
    if (!Array.isArray(leadSourceKeys) || !Array.isArray(validLeadSources)) return leadSourceKeys;
    
    return leadSourceKeys.map(key => {
      const leadSource = validLeadSources.find(ls => ls.label === key);
      return leadSource ? leadSource.value : key;
    });
  };

  // Helper to map filters to API query params
  const buildOpportunityParams = (metricType, count) => {
    const params = {};
    // Map filters to API params
    if (filters.assignedUser && Array.isArray(filters.assignedUser) && !filters.assignedUser.includes('all')) {
      params.assigned_to = filters.assignedUser;
    }
    if (filters.country && Array.isArray(filters.country) && !filters.country.includes('all')) {
      params.country = filters.country;
    }
    if (filters.club && Array.isArray(filters.club) && !filters.club.includes('all')) {
      params.location = filters.club;
    }
    if (filters.leadSource && Array.isArray(filters.leadSource) && !filters.leadSource.includes('all')) {
      params.lead_source = convertLeadSourceKeysToValues(filters.leadSource);
    }
    if (filters.pipeline && Array.isArray(filters.pipeline) && !filters.pipeline.includes('all')) {
      params.pipeline_name = filters.pipeline;
    }
    // Date range - use calculated dates from slice
    if (filters.calculatedStartDate && filters.calculatedEndDate) {
      const dateField = metricTypeConfigs[metricType]?.dateField || 'raw_created_at';
      params[`${dateField}_min`] = filters.calculatedStartDate;
      params[`${dateField}_max`] = filters.calculatedEndDate;
    }
    // Metric-specific params from config
    if (metricTypeConfigs[metricType]) {
      Object.assign(params, metricTypeConfigs[metricType]);
    }
    // Limit
    if (count) params.limit = Math.min(count, 50);
    return params;
  };

  const openModal = async (metricType, title, count, page = 1, extraParams = {}) => {
    setModalData((prev) => ({ ...prev, isOpen: true, title, loading: true, error: null, opportunities: [], totalCount: count, metricType }));
    try {
      const params = buildOpportunityParams(metricType);
      // Merge in any extra params (e.g., { source: 'Whatsapp' })
      Object.assign(params, extraParams);
      params.page = page;
      const data = await fetchOpportunities(params);
      const normalized = normalizeOpportunitiesResponse(data, countries);
      setModalData((prev) => ({
        ...prev,
        loading: false,
        opportunities: normalized,
        totalCount: data.count,
        metricType,
        queryParams: { ...params },
      }));
      setCurrentPage(page);
    } catch (error) {
      setModalData((prev) => ({ ...prev, loading: false, error: error.message || 'Failed to fetch opportunities', metricType }));
    }
  };

  const openTabbedModal = async (metricType, title, tabIdx = 0, page = 1) => {
    if (metricType === 'online-vs-offline') {
      setModalData({ isOpen: true, title, loading: true, tabs: [], activeTab: tabIdx });
      try {
        const onlineParams = { ...buildOpportunityParams('online-leads'), page: tabbedPages.online };
        const offlineParams = { ...buildOpportunityParams('offline-leads'), page: tabbedPages.offline };
        const [online, offline] = await Promise.all([
          fetchOpportunities(onlineParams),
          fetchOpportunities(offlineParams),
        ]);
        setModalData({
          isOpen: true,
          title,
          loading: false,
          tabs: [
            { label: 'Online Leads', data: normalizeOpportunitiesResponse(online, countries), totalCount: online.count, metricType: 'online-leads', queryParams: onlineParams },
            { label: 'Offline Leads', data: normalizeOpportunitiesResponse(offline, countries), totalCount: offline.count, metricType: 'offline-leads', queryParams: offlineParams },
          ],
          activeTab: tabIdx,
        });
        setActiveTab(tabIdx);
      } catch (error) {
        setModalData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    } else if (metricType === 'lead-to-sale') {
      setModalData({ isOpen: true, title, loading: true, tabs: [], activeTab: tabIdx });
      try {
        const njmParams = { ...buildOpportunityParams('total-njms'), page: tabbedPages.njm || 1 };
        const leadParams = { ...buildOpportunityParams('total-leads'), page: tabbedPages.lead || 1 };
        const [njms, leads] = await Promise.all([
          fetchOpportunities(njmParams),
          fetchOpportunities(leadParams),
        ]);
        setModalData({
          isOpen: true,
          title,
          loading: false,
          tabs: [
            { label: 'NJMs', data: normalizeOpportunitiesResponse(njms, countries), totalCount: njms.count, metricType: 'total-njms', queryParams: njmParams },
            { label: 'Leads', data: normalizeOpportunitiesResponse(leads, countries), totalCount: leads.count, metricType: 'total-leads', queryParams: leadParams },
          ],
          activeTab: tabIdx,
        });
        setActiveTab(tabIdx);
      } catch (error) {
        setModalData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    } else if (metricType === 'lead-to-appointment') {
      setModalData({ isOpen: true, title, loading: true, tabs: [], activeTab: tabIdx });
      try {
        const appointmentParams = { ...buildOpportunityParams('total-appointments'), page: tabbedPages.appointment || 1 };
        const leadParams = { ...buildOpportunityParams('total-leads'), page: tabbedPages.lead || 1 };
        const [appointments, leads] = await Promise.all([
          fetchOpportunities(appointmentParams),
          fetchOpportunities(leadParams),
        ]);
        setModalData({
          isOpen: true,
          title,
          loading: false,
          tabs: [
            { label: 'Appointments', data: normalizeOpportunitiesResponse(appointments, countries), totalCount: appointments.count, metricType: 'total-appointments', queryParams: appointmentParams },
            { label: 'Total Leads', data: normalizeOpportunitiesResponse(leads, countries), totalCount: leads.count, metricType: 'total-leads', queryParams: leadParams },
          ],
          activeTab: tabIdx,
        });
        setActiveTab(tabIdx);
      } catch (error) {
        setModalData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    } else if (metricType === 'appointment-to-sale') {
      setModalData({ isOpen: true, title, loading: true, tabs: [], activeTab: tabIdx });
      try {
        const njmParams = { ...buildOpportunityParams('total-njms'), page: tabbedPages.njm || 1 };
        const appointmentParams = { ...buildOpportunityParams('total-appointments'), page: tabbedPages.appointment || 1 };
        const [njms, appointments] = await Promise.all([
          fetchOpportunities(njmParams),
          fetchOpportunities(appointmentParams),
        ]);
        setModalData({
          isOpen: true,
          title,
          loading: false,
          tabs: [
            { label: 'NJMs', data: normalizeOpportunitiesResponse(njms, countries), totalCount: njms.count, metricType: 'total-njms', queryParams: njmParams },
            { label: 'Appointments', data: normalizeOpportunitiesResponse(appointments, countries), totalCount: appointments.count, metricType: 'total-appointments', queryParams: appointmentParams },
          ],
          activeTab: tabIdx,
        });
        setActiveTab(tabIdx);
      } catch (error) {
        setModalData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    } else if (metricType === 'agreement-vs-njm') {
      setModalData({ isOpen: true, title, loading: true, tabs: [], activeTab: tabIdx });
      try {
        const agreementParams = { ...buildOpportunityParams('membership-agreements'), page: tabbedPages.agreement || 1 };
        const njmParams = { ...buildOpportunityParams('total-njms'), page: tabbedPages.njm || 1 };
        const [agreements, njms] = await Promise.all([
          fetchOpportunities(agreementParams),
          fetchOpportunities(njmParams),
        ]);
        setModalData({
          isOpen: true,
          title,
          loading: false,
          tabs: [
            { label: 'Agreements', data: normalizeOpportunitiesResponse(agreements, countries), totalCount: agreements.count, metricType: 'membership-agreements', queryParams: agreementParams },
            { label: 'NJMs', data: normalizeOpportunitiesResponse(njms, countries), totalCount: njms.count, metricType: 'total-njms', queryParams: njmParams },
          ],
          activeTab: tabIdx,
        });
        setActiveTab(tabIdx);
      } catch (error) {
        setModalData((prev) => ({ ...prev, loading: false, error: error.message }));
      }
    } else {
      setModalData({
        isOpen: true,
        title,
        opportunities: [],
        totalCount: 0,
        tabs: [],
      });
    }
  };

  // When tabbedPages or activeTab changes, refetch the correct data for the tabbed modal
  useEffect(() => {
    if (modalData.tabs && modalData.tabs.length > 0) {
      if (modalData.title && modalData.title.includes('Lead to Sale')) {
        openTabbedModal(
          'lead-to-sale',
          modalData.title,
          activeTab,
          tabbedPages[activeTab === 0 ? 'njm' : 'lead']
        );
      } else if (modalData.title && modalData.title.includes('Online vs Offline')) {
        openTabbedModal(
          'online-vs-offline',
          modalData.title,
          activeTab,
          tabbedPages[activeTab === 0 ? 'online' : 'offline']
        );
      } else if (modalData.title && modalData.title.includes('Lead to Appointment')) {
        openTabbedModal(
          'lead-to-appointment',
          modalData.title,
          activeTab,
          tabbedPages[activeTab === 0 ? 'appointment' : 'lead']
        );
      } else if (modalData.title && modalData.title.includes('Appointment to Sale')) {
        openTabbedModal(
          'appointment-to-sale',
          modalData.title,
          activeTab,
          tabbedPages[activeTab === 0 ? 'njm' : 'appointment']
        );
      } else if (modalData.title && modalData.title.includes('Membership Agreement Conversion Rate')) {
        openTabbedModal(
          'agreement-vs-njm',
          modalData.title,
          activeTab,
          tabbedPages[activeTab === 0 ? 'agreement' : 'njm']
        );
      }
      // Add more cases if you have more tabbed modals
    }
    // eslint-disable-next-line
  }, [tabbedPages, activeTab]);

  const handleTabChange = (tabIdx) => {
    setActiveTab(tabIdx);
  };

  const handleTabPageChange = (tabIdx, page) => {
    if (modalData.title && modalData.title.includes('Lead to Sale')) {
      setTabbedPages((prev) => ({ ...prev, [tabIdx === 0 ? 'njm' : 'lead']: page }));
    } else if (modalData.title && modalData.title.includes('Lead to Appointment')) {
      setTabbedPages((prev) => ({ ...prev, [tabIdx === 0 ? 'appointment' : 'lead']: page }));
    } else if (modalData.title && modalData.title.includes('Appointment to Sale')) {
      setTabbedPages((prev) => ({ ...prev, [tabIdx === 0 ? 'njm' : 'appointment']: page }));
    } else if (modalData.title && modalData.title.includes('Membership Agreement Conversion Rate')) {
      setTabbedPages((prev) => ({ ...prev, [tabIdx === 0 ? 'agreement' : 'njm']: page }));
    } else {
      setTabbedPages((prev) => ({ ...prev, [tabIdx === 0 ? 'online' : 'offline']: page }));
    }
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      title: '',
      opportunities: [],
      totalCount: 0,
    });
  };

  if (!salesMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )}
      <div className="space-y-8">
        {/* Lead Analysis Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ClickableMetricCard
              title="Total NJMs (Sales)"
              value={salesMetrics.totalNJMs}
              icon={Target}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBgColor="bg-purple-100 dark:bg-purple-900"
              onClick={() => openModal('total-njms', 'Total NJMs (Sales) - GHL Opportunities', salesMetrics.totalNJMs)}
            />
            <ClickableMetricCard
              title="Total Appointments"
              value={salesMetrics.totalAppointments}
              icon={Calendar}
              iconColor="text-green-600 dark:text-green-400"
              iconBgColor="bg-green-100 dark:bg-green-900"
              onClick={() => openModal('total-appointments', 'Total Appointments - GHL Opportunities', salesMetrics.totalAppointments)}
            />
            <button
              type="button"
              onClick={() => openModal('leads-without-tags', 'Leads Without Source Tags - GHL Opportunities', Math.round(salesMetrics.totalNoLeadSource))}
              className="text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Leads Without Source Tags</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Math.round(salesMetrics.totalNoLeadSource).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view opportunities
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </button>
            <ClickableMetricCard
              title="Total Leads"
              value={salesMetrics.totalLeads}
              icon={Users}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBgColor="bg-blue-100 dark:bg-blue-900"
              onClick={() => openModal('total-leads', 'Total Leads - GHL Opportunities', salesMetrics.totalLeads)}
            />
            <button
              type="button"
              onClick={() => openTabbedModal('online-vs-offline', 'Online vs Offline Leads - GHL Opportunities')}
              className="text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Online vs Offline Leads</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(salesMetrics.online).toLocaleString()} Online
                    </span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(salesMetrics.offline).toLocaleString()} Offline
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view opportunities
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </button>
            <ClickableMetricCard
              title="Total Shown Appointments' Opportunities"
              value={Math.round(salesMetrics.appointment_showed)}
              icon={Eye}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBgColor="bg-emerald-100 dark:bg-emerald-900"
              onClick={() => openModal('shown-appointments', 'Total Shown Appointments - GHL Opportunities', Math.round(salesMetrics.totalAppointments * 0.65))}
            />
          </div>

          {/* Trend Graphs Section */}
          <TrendGraphs openModal={openModal}/>
        </div>

        {/* Charts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources & Appointment Analysis</h3>
            </div>

          </div>
          
          <ChartSection
            leadSources={salesMetrics.leadSourceBreakdown}
            appointmentStatus={salesMetrics.appointmentStatus}
            openModal={openModal}
          />
        </div>

        {/* NJM Analysis Section */}
        <NJMAnalysis salesMetrics={salesMetrics} openModal={openModal} />

        {/* Sales Funnel Ratios Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Funnel Ratios</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => openTabbedModal('lead-to-sale', 'Lead to Sale Ratio - GHL Opportunities')}
              className="text-left bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {salesMetrics.leadToSaleRatio}%
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Lead to Sale Ratio</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">NJM / Total Leads</div>
                <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full inline-block">
                  {salesMetrics.totalNJMs} / {salesMetrics.totalLeads}
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openTabbedModal('lead-to-appointment', 'Lead to Appointment Ratio - GHL Opportunities')}
              className="text-left bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {salesMetrics.leadToAppointmentRatio}%
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Lead to Appointment Ratio</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Appointments / Total Leads</div>
                <div className="mt-3 text-xs text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-1 rounded-full inline-block">
                  {salesMetrics.totalAppointments} / {salesMetrics.totalLeads}
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openTabbedModal('appointment-to-sale', 'Appointment to Sale Ratio - GHL Opportunities')}
              className="text-left bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6 border border-purple-200 dark:border-purple-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {simplifyRatio(salesMetrics.totalAppointments, salesMetrics.totalNJMs)}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Appointment to Sale Ratio</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Appointments / NJM</div>
                <div className="mt-3 text-xs text-purple-700 dark:text-purple-300 bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full inline-block">
                  {salesMetrics.totalAppointments} / {salesMetrics.totalNJMs}
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Membership Agreements */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Membership Agreements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClickableMetricCard
              title="Total Membership Agreements"
              value={salesMetrics.membershipAgreements}
              icon={FileText}
              iconColor="text-orange-600 dark:text-orange-400"
              iconBgColor="bg-orange-100 dark:bg-orange-900"
              onClick={() => openModal('membership-agreements', 'Membership Agreements - GHL Opportunities', salesMetrics.membershipAgreements)}
            />
            
            <div 
              onClick={() => openTabbedModal('agreement-vs-njm', 'Membership Agreement Conversion Rate - GHL Opportunities')}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Conversion Rate</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {((salesMetrics.membershipAgreements / salesMetrics.totalNJMs) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Agreements ÷ NJMs</p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view opportunities
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Opportunity Modal */}
        <OpportunityModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          title={modalData.title}
          opportunities={modalData.opportunities}
          totalCount={modalData.totalCount}
          tabs={modalData.tabs}
          loading={modalData.loading}
          error={modalData.error}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => openModal(modalData.metricType, modalData.title, modalData.totalCount, page)}
          activeTab={modalData.activeTab}
          onTabChange={handleTabChange}
          onTabPageChange={handleTabPageChange}
          tabbedPages={tabbedPages}
          queryParams={modalData.queryParams}
        />
      </div>
    </div>
  );
};

export default SalesPipeline;