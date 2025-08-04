import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  onItemsPerPageChange,
  showPageInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = "",
  disabled = false
}) => {
  // Calculate pagination range
  const getPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    
    if (currentPage + halfRange >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Calculate item range for current page
  const getItemRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (onItemsPerPageChange && !disabled) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // Don't render if there's only one page
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  const pageNumbers = getPageNumbers();
  const itemRange = getItemRange();

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 py-4 ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            disabled={disabled}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      )}

      {/* Page info */}
      {showPageInfo && (
        <div className="text-sm text-gray-700">
          Showing {itemRange.start} to {itemRange.end} of {totalItems} results
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-1">
          {/* First page button */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || disabled}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* Previous page button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {/* Show ellipsis if there are pages before the visible range */}
            {pageNumbers[0] > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={disabled}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1
                </button>
                {pageNumbers[0] > 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </>
            )}

            {/* Visible page numbers */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                className={`px-3 py-2 text-sm border rounded-md disabled:cursor-not-allowed ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Show ellipsis if there are pages after the visible range */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={disabled}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next page button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page button */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;