import React from "react";

const EmployeeGridPagination = ({ pagination, onPageChange, onNextPage, onPrevPage }) => {
  const { currentPage, totalPages, totalEmployees, hasNext, hasPrev } = pagination;

  // Generate page numbers array
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return (
      <div className="mt-6 text-center text-sm text-gray-600">
        Showing {totalEmployees} employees
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages} ({totalEmployees} total employees)
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={onPrevPage}
          disabled={!hasPrev}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            hasPrev
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex space-x-1">
          {getPageNumbers().map((pageNumber, index) => (
            <button
              key={index}
              onClick={() => typeof pageNumber === 'number' ? onPageChange(pageNumber) : null}
              disabled={typeof pageNumber !== 'number'}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pageNumber === currentPage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : typeof pageNumber === 'number'
                  ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  : 'text-gray-400 bg-white border border-gray-300 cursor-default'
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-500">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!hasNext}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            hasNext
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeGridPagination;