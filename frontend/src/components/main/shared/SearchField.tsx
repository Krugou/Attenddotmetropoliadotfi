import React from 'react';

interface SearchOption {
  value: string;
  label: string;
}

interface SearchFieldProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchField: string;
  onSearchFieldChange: (value: string) => void;
  onClearSearch: () => void;
  searchFields: SearchOption[];
  placeholder?: string;
  searchLabel?: string;
  searchInLabel?: string;
  resultsCount?: number;
  className?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
  searchTerm,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  onClearSearch,
  searchFields,
  placeholder = 'Search...',
  searchLabel = 'Search',
  searchInLabel = 'Search in',
  resultsCount,
  className = '',
}) => {
  return (
    <div className={`flex flex-col lg:flex-row gap-4 items-start ${className}`}>
      <div className='relative lg:w-1/3 w-full'>
        <label className='block text-metropolia-main-grey text-sm font-medium mb-2'>
          {searchLabel}
        </label>
        <div className='relative'>
          <div className='absolute left-3 top-2.5 text-metropolia-main-grey'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-metropolia-trend-light-blue focus:border-metropolia-trend-light-blue transition-all duration-300'
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className='absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100 text-metropolia-main-grey hover:text-metropolia-support-red transition-colors'
              aria-label='Clear search'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className='lg:w-1/4 w-full'>
        <label className='block text-metropolia-main-grey text-sm font-medium mb-2'>
          {searchInLabel}
        </label>
        <select
          title={searchInLabel}
          value={searchField}
          onChange={(e) => onSearchFieldChange(e.target.value)}
          className='w-full rounded-md border-gray-300 shadow-sm focus:border-metropolia-trend-light-blue focus:ring focus:ring-metropolia-trend-light-blue focus:ring-opacity-50 py-2 px-3'>
          {searchFields.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>
      {resultsCount !== undefined && searchTerm && (
        <div className='lg:ml-auto lg:mt-8 mt-2'>
          <p className='text-sm text-metropolia-main-grey bg-gray-50 px-4 py-2 rounded-full'>
            {resultsCount} results found
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchField;
