import React, { useState, useCallback } from 'react';
import { X, MapPin, Users, Calendar, Target, GripVertical } from 'lucide-react';

const LocationWiseModal = ({ isOpen, onClose, data, loading, error, columnOrder }) => {
  if (!isOpen) return null;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  };

  // Default column configuration
  const defaultColumns = [
    { key: 'location_name', label: 'Location', type: 'text', align: 'left' },
    { key: 'country_display', label: 'Country', type: 'text', align: 'left' },
    { key: 'total_opps', label: 'Total Opportunities', type: 'number', align: 'right' },
    { key: 'oppo_online', label: 'Opportunities Online', type: 'number', align: 'right' },
    { key: 'oppo_offline', label: 'Opportunities Offline', type: 'number', align: 'right' },
    { key: 'total_appointments', label: 'Total Appointments', type: 'number', align: 'right' },
    { key: 'njms_total', label: 'Total NJMs', type: 'number', align: 'right' },
    { key: 'njm_online', label: 'NJM Online', type: 'number', align: 'right' },
    { key: 'njm_offline', label: 'NJM Offline', type: 'number', align: 'right' },
    { key: 'total_no_lead_source_tag', label: 'No Lead Source Tag', type: 'number', align: 'right' }
  ];

  // State for drag and drop
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [currentColumns, setCurrentColumns] = useState(columnOrder || defaultColumns);

  // Update columns when columnOrder prop changes
  React.useEffect(() => {
    if (columnOrder) {
      setCurrentColumns(columnOrder);
    }
  }, [columnOrder]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, columnIndex) => {
    setDraggedColumn(columnIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }, []);

  const handleDragOver = useCallback((e, columnIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnIndex);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    if (draggedColumn === null || draggedColumn === dropIndex) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newColumns = [...currentColumns];
    const draggedItem = newColumns[draggedColumn];
    
    // Remove the dragged item
    newColumns.splice(draggedColumn, 1);
    
    // Insert it at the new position
    newColumns.splice(dropIndex, 0, draggedItem);
    
    setCurrentColumns(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [draggedColumn, currentColumns]);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Use current columns state
  const columns = currentColumns;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Location-wise Opportunity Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Performance metrics by location • Drag columns to reorder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentColumns(defaultColumns)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Reset column order"
            >
              Reset Order
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading location data...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 mb-2">Error loading data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
              </div>
            </div>
          )}

          {!loading && !error && data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {columns.map((column, index) => (
                      <th 
                        key={`${column.key}-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`py-3 px-4 font-semibold text-gray-900 dark:text-white select-none cursor-move transition-all duration-200 ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${
                          draggedColumn === index 
                            ? 'opacity-50 bg-blue-100 dark:bg-blue-900' 
                            : dragOverColumn === index 
                              ? 'bg-blue-50 dark:bg-blue-800 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          <span>{column.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((location, index) => {
                    return (
                      <tr 
                        key={location.location_id || index}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {columns.map((column, colIndex) => {
                          const value = location[column.key];
                          const displayValue = column.type === 'number' ? formatNumber(value) : (value || '-');
                          
                          return (
                            <td 
                              key={colIndex}
                              className={`py-3 px-4 ${
                                column.align === 'right' ? 'text-right' : 'text-left'
                              } ${
                                column.key === 'location_name' ? 'whitespace-nowrap' : ''
                              }`}
                            >
                              <span 
                                className={`${
                                  column.type === 'number' 
                                    ? 'font-semibold text-gray-900 dark:text-white'
                                    : column.key === 'location_name'
                                      ? 'font-medium text-gray-900 dark:text-white block truncate max-w-xs'
                                      : 'text-gray-600 dark:text-gray-400'
                                }`}
                                title={column.key === 'location_name' ? (location.location_name || '-') : undefined}
                              >
                                {column.key === 'country_display' 
                                  ? (location.country_display || location.country_code || '-')
                                  : displayValue
                                }
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (!data || data.length === 0) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600 dark:text-gray-400">No location data available</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data && data.length > 0 && (
              <span>Showing {data.length} location{data.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationWiseModal;
