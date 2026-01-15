import React, { useState, useMemo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiEye,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const DataTable = ({
  columns,
  data,
  isLoading = false,
  pagination = true,
  searchable = true,
  selectable = false,
  actions = [],
  onRowClick,
  onSelectionChange,
  emptyMessage = 'No data found',
  theme = 'light',
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100]
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-gray-800 text-gray-100' 
      : 'bg-white text-gray-900',
    header: theme === 'dark' 
      ? 'bg-gray-900 border-gray-700 text-gray-300' 
      : 'bg-gray-50 border-gray-200 text-gray-700',
    row: theme === 'dark'
      ? 'border-gray-700 hover:bg-gray-700/50'
      : 'border-gray-200 hover:bg-gray-50',
    selected: theme === 'dark'
      ? 'bg-blue-900/30 border-blue-800'
      : 'bg-blue-50 border-blue-200',
    input: theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        columns.some(col => {
          const value = col.accessor ? row[col.accessor] : '';
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }

    // Apply sorting
    if (sortColumn) {
      const column = columns.find(col => col.accessor === sortColumn);
      if (column && column.sortable !== false) {
        filtered.sort((a, b) => {
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          return sortDirection === 'asc' 
            ? (aValue || 0) - (bValue || 0)
            : (bValue || 0) - (aValue || 0);
        });
      }
    }

    return filtered;
  }, [data, columns, searchTerm, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, currentPageSize, pagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, processedData.length);

  // Handle sort
  const handleSort = (columnAccessor) => {
    if (sortColumn === columnAccessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnAccessor);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(row => row.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`rounded-lg border ${themeClasses.container} p-8 text-center`}>
        <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Loading data...
        </p>
      </div>
    );
  }

  // Render empty state
  if (processedData.length === 0) {
    return (
      <div className={`rounded-lg border ${themeClasses.container} p-8 text-center`}>
        <div className="text-4xl mb-4 opacity-50">📊</div>
        <h3 className="text-lg font-medium mb-2">
          {searchTerm ? 'No results found' : emptyMessage}
        </h3>
        {searchTerm && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Try adjusting your search term
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Box */}
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input}`}
            />
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Show:
              </span>
              <select
                value={currentPageSize}
                onChange={(e) => {
                  setCurrentPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded border text-sm ${themeClasses.input}`}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {startItem}-{endItem} of {processedData.length}
            </span>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          {/* Table Header */}
          <thead className={themeClasses.header}>
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`p-3 text-left font-medium ${
                    column.sortable !== false ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && (
                      <span>
                        {sortColumn === column.accessor ? (
                          sortDirection === 'asc' ? (
                            <FiChevronUp size={14} />
                          ) : (
                            <FiChevronDown size={14} />
                          )
                        ) : (
                          <span className="opacity-30">
                            <FiChevronUp size={14} />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              {actions.length > 0 && (
                <th className="p-3 text-left font-medium">Actions</th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-700 dark:divide-gray-700">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`transition-colors ${
                  selectedRows.has(row.id) 
                    ? themeClasses.selected 
                    : themeClasses.row
                } ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {/* Row Selection Checkbox */}
                {selectable && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleRowSelect(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                )}

                {/* Data Cells */}
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-3">
                    {column.cell 
                      ? column.cell(row[column.accessor], row)
                      : row[column.accessor]
                    }
                  </td>
                ))}

                {/* Action Cells */}
                {actions.length > 0 && (
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {actions.map((action, actionIndex) => {
                        const Icon = action.icon || FiEdit;
                        return (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={`p-1.5 rounded ${
                              action.variant === 'danger'
                                ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
                                : action.variant === 'success'
                                ? 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={action.label}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              <FiChevronsLeft size={18} />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      currentPage === pageNum
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              <FiChevronRight size={18} />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-200'
              }`}
            >
              <FiChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;