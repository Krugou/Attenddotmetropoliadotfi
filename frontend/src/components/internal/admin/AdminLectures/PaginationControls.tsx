import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPrevious: () => void;
  onNext: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
                                                                 currentPage,
                                                                 totalPages,
                                                                 totalItems,
                                                                 itemsPerPage,
                                                                 onPrevious,
                                                                 onNext,
                                                               }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className='flex items-center justify-between my-4'>
      <div className='text-sm text-gray-700'>
        Showing {startItem} to {endItem} of {totalItems} lectures
      </div>
      <div className='flex gap-2'>
        {currentPage > 1 && (
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className='px-3 py-1 text-white rounded-sm bg-metropolia-main-orange disabled:opacity-50'
          >
            Previous
          </button>
        )}
        <span className='px-4 py-1'>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className='px-3 py-1 text-white rounded-sm bg-metropolia-main-orange disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
