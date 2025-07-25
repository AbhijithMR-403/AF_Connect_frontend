import React, { useState } from 'react';
import { X, ExternalLink, Calendar, User, DollarSign, Tag, ChevronLeft, ChevronRight, MapPin, Globe } from 'lucide-react';
import { exportOpportunitiesCsv } from '../services/api';

const ITEMS_PER_PAGE = 10;

const OpportunityModal = ({
  isOpen,
  onClose,
  title,
  opportunities = [],
  totalCount = 0,
  tabs,
  loading = false,
  error = null,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  activeTab = 0,
  onTabChange,
  onTabPageChange,
  tabbedPages = { online: 1, offline: 1 },
  queryParams,
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-900 dark:text-white font-semibold">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="text-red-600 dark:text-red-400 font-semibold mb-2">{error}</div>
          <button onClick={onClose} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  // If tabs are present, use tabbed display
  const isTabbed = Array.isArray(tabs) && tabs.length > 0;
  const tab = isTabbed ? tabs[activeTab] : null;
  let tabPage = currentPage;
  if (isTabbed) {
    if (title && title.includes('Lead to Sale')) {
      tabPage = activeTab === 0 ? tabbedPages.njm : tabbedPages.lead;
    } else if (title && title.includes('Online vs Offline')) {
      tabPage = activeTab === 0 ? tabbedPages.online : tabbedPages.offline;
    } else if (title && title.includes('Lead to Appointment')) {
      tabPage = activeTab === 0 ? tabbedPages.appointment : tabbedPages.lead;
    } else if (title && title.includes('Appointment to Sale')) {
      tabPage = activeTab === 0 ? tabbedPages.njm : tabbedPages.appointment;
    }
  }
  const tabTotalPages = isTabbed ? Math.ceil((tab?.totalCount || 0) / pageSize) : 1;
  const tabOpportunities = isTabbed ? tab?.data || [] : opportunities;
  const tabTotalCount = isTabbed ? tab?.totalCount || 0 : totalCount;

  // Reset to first page when switching tabs
  const handleTabChange = (tabIndex) => {
    if (onTabChange) onTabChange(tabIndex);
    if (onPageChange) onPageChange(1); // Reset to first page when switching tabs
  };

  // Pagination calculations
  const totalPages = Math.ceil((totalCount || opportunities.length) / pageSize);
  const paginatedOpportunities = opportunities;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStageColor = (stage) => {
    if (typeof stage !== 'string') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    switch (stage.toLowerCase()) {
      case 'new lead':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'appointment booked':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'appointment completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'membership agreement':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'closed won':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'closed lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case '15-min gofast':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'af results':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'app download':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'contacted':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      let params = {};
      if (isTabbed && tab && tab.queryParams) {
        params = { ...tab.queryParams };
      } else if (!isTabbed && queryParams) {
        params = { ...queryParams };
      } else {
        params = { page: isTabbed ? tabPage : currentPage };
      }
      const { blob, filename } = await exportOpportunitiesCsv(params);
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'opportunities.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Showing {((tabPage - 1) * pageSize) + 1}-{Math.min(tabPage * pageSize, tabTotalCount)} of {tabTotalCount} opportunities
              {tabTotalPages > 1 && (
                <span className="ml-2">
                  (Page {tabPage} of {tabTotalPages})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Tabs (if provided) */}
        {isTabbed && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
            <div className="flex space-x-1 p-2 sm:p-4 overflow-x-auto">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.label}
                  onClick={() => handleTabChange(idx)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                    activeTab === idx
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.totalCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="overflow-auto flex-1 min-h-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Assigned To
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {(tabOpportunities || []).map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {opportunity.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        ID: {opportunity.id}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {typeof opportunity.contact === 'string' ? opportunity.contact :
                            (opportunity.contact && typeof opportunity.contact === 'object' && (opportunity.contact.first_name || opportunity.contact.firstName || opportunity.contact.email)) ||
                            '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {typeof opportunity.country === 'string' ? opportunity.country :
                            (opportunity.country && typeof opportunity.country === 'object' && (opportunity.country.name || opportunity.country.id)) ||
                            '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {typeof opportunity.location === 'string' ? opportunity.location :
                            (opportunity.location && typeof opportunity.location === 'object' && (opportunity.location.name || opportunity.location.id)) ||
                            '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                        {typeof opportunity.stage === 'string' ? opportunity.stage :
                          (opportunity.stage && typeof opportunity.stage === 'object' && (opportunity.stage.name || opportunity.stage.id)) ||
                          '-'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        {/* <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-1 flex-shrink-0" /> */}
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {typeof opportunity.value === 'number' && !isNaN(opportunity.value)
                            ? `$${opportunity.value.toLocaleString()}`
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {typeof opportunity.source === 'string' ? opportunity.source :
                            (opportunity.source && typeof opportunity.source === 'object' && (opportunity.source.name || opportunity.source.id)) ||
                            '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                      <div className="truncate max-w-[120px]">
                        {typeof opportunity.assignedTo === 'string' ? opportunity.assignedTo :
                          (opportunity.assignedTo && typeof opportunity.assignedTo === 'object' && (opportunity.assignedTo.first_name || opportunity.assignedTo.firstName || opportunity.assignedTo.email)) ||
                          '-'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                            {opportunity.createdDate}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">
                            Last: {opportunity.lastActivity}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                        {opportunity.status.toUpperCase()}
                      </span>
                    </td>
                    {/* <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">View in GHL</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {(isTabbed ? tabTotalPages : totalPages) > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-3 flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              {isTabbed
                ? `Page ${tabPage} of ${tabTotalPages} (Total: ${tabTotalCount})`
                : `Page ${currentPage} of ${totalPages} (Total: ${totalCount})`}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => (isTabbed
                  ? onTabPageChange && onTabPageChange(activeTab, Math.max(1, tabPage - 1))
                  : onPageChange && onPageChange(Math.max(1, currentPage - 1)))}
                disabled={isTabbed ? tabPage === 1 : currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const numPages = isTabbed ? tabTotalPages : totalPages;
                  const currPage = isTabbed ? tabPage : currentPage;
                  if (numPages <= 7) {
                    for (let i = 1; i <= numPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    if (currPage > 4) pages.push('...');
                    const start = Math.max(2, currPage - 1);
                    const end = Math.min(numPages - 1, currPage + 1);
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    if (currPage < numPages - 3) pages.push('...');
                    pages.push(numPages);
                  }
                  return pages.map((page, idx) =>
                    page === '...'
                      ? <span key={"ellipsis-" + idx} className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-300">...</span>
                      : <button
                          key={page}
                          onClick={() => (isTabbed
                            ? onTabPageChange && onTabPageChange(activeTab, page)
                            : onPageChange && onPageChange(page))}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            currPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                  );
                })()}
              </div>
              <button
                onClick={() => (isTabbed
                  ? onTabPageChange && onTabPageChange(activeTab, Math.min(tabTotalPages, tabPage + 1))
                  : onPageChange && onPageChange(Math.min(totalPages, currentPage + 1)))}
                disabled={isTabbed ? tabPage === tabTotalPages : currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-3 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
            Total opportunities: {tabTotalCount}
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              disabled={exporting}
              onClick={handleExport}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
          {exportError && (
            <div className="text-xs text-red-600 mt-2 w-full text-right">{exportError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityModal;