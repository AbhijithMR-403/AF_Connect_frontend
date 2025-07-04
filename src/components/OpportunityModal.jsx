import React, { useState } from 'react';
import { X, ExternalLink, Calendar, User, DollarSign, Tag, ChevronLeft, ChevronRight, MapPin, Globe } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const OpportunityModal = ({
  isOpen,
  onClose,
  title,
  opportunities = [],
  totalCount = 0,
  tabs,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const currentOpportunities = tabs ? tabs[activeTab]?.opportunities || [] : opportunities;
  const currentCount = tabs ? tabs[activeTab]?.count || 0 : totalCount;

  // Reset to first page when switching tabs
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(currentOpportunities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOpportunities = currentOpportunities.slice(startIndex, endIndex);

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
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'new lead':
        return 'bg-blue-100 text-blue-800';
      case 'appointment booked':
        return 'bg-green-100 text-green-800';
      case 'appointment completed':
        return 'bg-purple-100 text-purple-800';
      case 'membership agreement':
        return 'bg-orange-100 text-orange-800';
      case 'closed won':
        return 'bg-emerald-100 text-emerald-800';
      case 'closed lost':
        return 'bg-red-100 text-red-800';
      case '15-min gofast':
        return 'bg-cyan-100 text-cyan-800';
      case 'af results':
        return 'bg-indigo-100 text-indigo-800';
      case 'app download':
        return 'bg-pink-100 text-pink-800';
      case 'contacted':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Showing {paginatedOpportunities.length} of {currentCount.toLocaleString()} opportunities
              {totalPages > 1 && (
                <span className="ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs (if provided) */}
        {tabs && tabs.length > 0 && (
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-1 p-2 sm:p-4 overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(index)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === index
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                    activeTab === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="overflow-auto max-h-[calc(95vh-280px)] sm:max-h-[calc(90vh-280px)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Assigned To
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {opportunity.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {opportunity.id}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-gray-900 truncate">
                          {opportunity.contact}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 truncate">
                          {opportunity.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 truncate">
                          {opportunity.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          ${opportunity.value.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-900 truncate">
                          {opportunity.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                      <div className="truncate max-w-[120px]">{opportunity.assignedTo}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm text-gray-900">
                            {opportunity.createdDate}
                          </div>
                          <div className="text-xs text-gray-500">
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
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">View in GHL</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, currentOpportunities.length)} of {currentOpportunities.length} entries
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 gap-3">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Total opportunities: {currentCount.toLocaleString()}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityModal;