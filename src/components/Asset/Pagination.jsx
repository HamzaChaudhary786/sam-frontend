// components/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded-md ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
