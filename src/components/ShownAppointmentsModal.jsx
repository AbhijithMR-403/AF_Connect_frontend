import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ShownAppointmentsModal = ({
  isOpen,
  onClose,
  title,
  events = [],
  totalCount = 0,
  loading = false,
  error = null,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-900 dark:text-white font-semibold">Loading appointments...</div>
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

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const startIdx = ((currentPage - 1) * pageSize) + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount || 0);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Showing {totalCount ? `${startIdx}-${endIdx}` : '0-0'} of {totalCount} appointments
              {totalPages > 1 && (
                <span className="ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1 min-h-0 hide-scrollbar">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full min-w-[1600px]">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appointment Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Time</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raw Start Time</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Time</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned User</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raw Date Added</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date Added</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event ID</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(events) && events.length > 0 ? (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                          {evt.title || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.status || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.appointment_status || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{formatDateTime(evt.start_time)}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{formatDateTime(evt.raw_start_time)}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{formatDateTime(evt.end_time)}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.contact_full_name || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.contact || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.location_name || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.location || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.country || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.assigned_user_full_name || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{formatDateTime(evt.raw_date_added)}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{formatDateTime(evt.date_added)}</td>
                      <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{evt.id || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-3 sm:px-6 py-10 text-center text-sm text-gray-600 dark:text-gray-300">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-900">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={String(p)}
                  type="button"
                  onClick={() => typeof p === 'number' && onPageChange?.(p)}
                  disabled={p === '...'}
                  className={`px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm ${
                    p === currentPage
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${p === '...' ? 'cursor-default opacity-60' : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShownAppointmentsModal;

