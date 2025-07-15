import React, { useState } from 'react';
import { Users, Calendar, Target, FileText, TrendingUp, AlertCircle, BarChart3, Phone, Eye } from 'lucide-react';
import { useAppSelector } from '../hooks';
import ClickableMetricCard from './ClickableMetricCard';
import ChartSection from './ChartSection';
import TrendGraphs from './TrendGraphs';
import OpportunityModal from './OpportunityModal';
import { generateOpportunitiesForMetric, generateTabbedOpportunities } from '../utils/mockOpportunityData';

const SalesPipeline = () => {
  const { salesMetrics } = useAppSelector((state) => state.dashboard);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    opportunities: [],
    totalCount: 0,
  });

  const openModal = (metricType, title, count) => {
    if (!salesMetrics) return;
    
    const opportunities = generateOpportunitiesForMetric(metricType, Math.min(count, 50), salesMetrics);
    setModalData({
      isOpen: true,
      title,
      opportunities,
      totalCount: count,
    });
  };

  const openTabbedModal = (metricType, title) => {
    if (!salesMetrics) return;
    
    const tabs = generateTabbedOpportunities(metricType, salesMetrics);
    setModalData({
      isOpen: true,
      title,
      opportunities: [],
      totalCount: 0,
      tabs,
    });
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
            change={salesMetrics.percentageChanges.njms}
            icon={Target}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-900"
            onClick={() => openModal('total-njms', 'Total NJMs (Sales) - GHL Opportunities', salesMetrics.totalNJMs)}
          />
          <ClickableMetricCard
            title="Total Appointments"
            value={salesMetrics.totalAppointments}
            change={salesMetrics.percentageChanges.appointments}
            icon={Calendar}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-900"
            onClick={() => openModal('total-appointments', 'Total Appointments - GHL Opportunities', salesMetrics.totalAppointments)}
          />
          <div 
            onClick={() => openModal('leads-without-tags', 'Leads Without Source Tags - GHL Opportunities', Math.round(salesMetrics.totalLeads * 0.08))}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Leads Without Source Tags</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {Math.round(salesMetrics.totalLeads * 0.08).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    8%
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
          </div>
          <ClickableMetricCard
            title="Total Leads"
            value={salesMetrics.totalLeads}
            change={salesMetrics.percentageChanges.leads}
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            onClick={() => openModal('total-leads', 'Total Leads - GHL Opportunities', salesMetrics.totalLeads)}
          />
          <div 
            onClick={() => openTabbedModal('online-vs-offline', 'Online vs Offline Leads - GHL Opportunities')}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Online vs Offline Leads</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(salesMetrics.totalLeads * 0.75).toLocaleString()} Online
                  </span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(salesMetrics.totalLeads * 0.25).toLocaleString()} Offline
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
          </div>
          <ClickableMetricCard
            title="Total Shown Appointments"
            value={Math.round(salesMetrics.totalAppointments * 0.65)}
            change={8.7}
            icon={Eye}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBgColor="bg-emerald-100 dark:bg-emerald-900"
            onClick={() => openModal('shown-appointments', 'Total Shown Appointments - GHL Opportunities', Math.round(salesMetrics.totalAppointments * 0.65))}
          />
        </div>

        {/* Trend Graphs Section */}
        <TrendGraphs />
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources & Appointment Analysis</h3>
        </div>
        
        <ChartSection
          leadSources={salesMetrics.leadSourceBreakdown}
          appointmentStatus={salesMetrics.appointmentStatus}
        />
      </div>

      {/* NJM Analysis Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NJM Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ClickableMetricCard
            title="Contacted"
            value={Math.round(salesMetrics.totalNJMs * 0.85)}
            change={12.3}
            icon={Phone}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            onClick={() => openModal('contacted-njms', 'Contacted NJMs - GHL Opportunities', Math.round(salesMetrics.totalNJMs * 0.85))}
          />
          
          <div 
            onClick={() => openModal('facebook-leads', 'NJM by Lead Source - GHL Opportunities', salesMetrics.totalNJMs)}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">NJM by Lead Source</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">Facebook:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(salesMetrics.totalNJMs * 0.35)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">Instagram:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(salesMetrics.totalNJMs * 0.25)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">Google Ads:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(salesMetrics.totalNJMs * 0.19)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">Outreach:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(salesMetrics.totalNJMs * 0.12)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">Referral:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round(salesMetrics.totalNJMs * 0.09)}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => openModal('paid-media-njms', 'NJM from Paid Media - GHL Opportunities', Math.round(salesMetrics.totalNJMs * 0.79))}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">NJM from Paid Media</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(salesMetrics.totalNJMs * 0.79).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    79%
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Facebook + IG + Google Ads</p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view opportunities
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Funnel Ratios Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Funnel Ratios</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => openTabbedModal('lead-to-sale', 'Lead to Sale Ratio - GHL Opportunities')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                {salesMetrics.leadToSaleRatio}%
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Lead to Sale Ratio</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">NJM ÷ Total Leads</div>
              <div className="mt-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full inline-block">
                {salesMetrics.totalNJMs} / {salesMetrics.totalLeads}
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view opportunities
              </div>
            </div>
          </div>

          <div 
            onClick={() => openTabbedModal('lead-to-appointment', 'Lead to Appointment Ratio - GHL Opportunities')}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                {salesMetrics.leadToAppointmentRatio}%
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Lead to Appointment Ratio</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Appointments ÷ Total Leads</div>
              <div className="mt-3 text-xs text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-1 rounded-full inline-block">
                {salesMetrics.totalAppointments} / {salesMetrics.totalLeads}
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view opportunities
              </div>
            </div>
          </div>

          <div 
            onClick={() => openTabbedModal('appointment-to-sale', 'Appointment to Sale Ratio - GHL Opportunities')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6 border border-purple-200 dark:border-purple-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                {salesMetrics.appointmentToSaleRatio}%
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Appointment to Sale Ratio</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">NJM ÷ Appointments</div>
              <div className="mt-3 text-xs text-purple-700 dark:text-purple-300 bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full inline-block">
                {salesMetrics.totalNJMs} / {salesMetrics.totalAppointments}
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view opportunities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Agreements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Membership Agreements</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClickableMetricCard
            title="Total Membership Agreements"
            value={salesMetrics.membershipAgreements}
            change={salesMetrics.percentageChanges.memberships}
            icon={FileText}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBgColor="bg-orange-100 dark:bg-orange-900"
            onClick={() => openModal('membership-agreements', 'Membership Agreements - GHL Opportunities', salesMetrics.membershipAgreements)}
          />
          
          <div 
            onClick={() => openModal('membership-agreements', 'Membership Agreement Conversion Rate - GHL Opportunities', salesMetrics.membershipAgreements)}
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
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        opportunities={modalData.opportunities}
        totalCount={modalData.totalCount}
        tabs={modalData.tabs}
      />
    </div>
  );
};

export default SalesPipeline;