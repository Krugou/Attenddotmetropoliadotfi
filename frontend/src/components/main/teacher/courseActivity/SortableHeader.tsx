import React from 'react';
import {useTranslation} from 'react-i18next';
import {SortField, SortOrder} from './types';

interface SortableHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
}) => (
  <th
    onClick={() => onSort(field)}
    className='px-4 py-2 cursor-pointer select-none'>
    <div className='flex items-center justify-between'>
      <span>{label}</span>
      <div className='flex items-center'>
        {sortField === field ? (
          <span className='ml-1'>
            <svg
              className={`w-4 h-4 text-metropolia-main-orange transform transition-transform ${
                sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </span>
        ) : (
          <span className='ml-1 opacity-20 hover:opacity-100'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </span>
        )}
      </div>
    </div>
  </th>
);
