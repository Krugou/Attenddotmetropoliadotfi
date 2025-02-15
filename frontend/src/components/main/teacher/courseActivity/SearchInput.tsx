import React from 'react';
import {useTranslation} from 'react-i18next';

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const {t} = useTranslation();

  return (
    <div className='relative w-full lg:w-72 xl:w-96'>
      <input
        type='text'
        placeholder={t('common:search')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='w-full px-11 py-2.5 border-2 border-gray-200 rounded-lg
          focus:ring-2 focus:ring-metropolia-main-orange focus:border-metropolia-main-orange
          transition-colors duration-200'
      />
      <svg
        className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
        />
      </svg>
    </div>
  );
};
