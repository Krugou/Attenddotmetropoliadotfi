import React from 'react';
import {useTranslation} from 'react-i18next';
import {FilterPeriod} from './types';

interface FilterButtonsProps {
  filterPeriod: FilterPeriod;
  setFilterPeriod: (period: FilterPeriod) => void;
  threshold?: number;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  filterPeriod,
  setFilterPeriod,
  threshold,
}) => {
  const {t} = useTranslation();

  return (
    <div className='flex flex-wrap gap-3'>
      <button
        onClick={() => setFilterPeriod('all')}
        className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
          ${
            filterPeriod === 'all'
              ? 'bg-metropolia-main-orange text-white shadow-md scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-metropolia-main-orange hover:text-metropolia-main-orange'
          }`}>
        {t('common:allTime')}
      </button>
      <button
        onClick={() => setFilterPeriod('week')}
        className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
          ${
            filterPeriod === 'week'
              ? 'bg-metropolia-main-orange text-white shadow-md scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-metropolia-main-orange hover:text-metropolia-main-orange'
          }`}>
        {t('common:lastWeek')}
      </button>
      <button
        onClick={() => setFilterPeriod('month')}
        className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
          ${
            filterPeriod === 'month'
              ? 'bg-metropolia-main-orange text-white shadow-md scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-metropolia-main-orange hover:text-metropolia-main-orange'
          }`}>
        {t('common:lastMonth')}
      </button>
      {threshold && typeof threshold === 'number' && (
        <button
          onClick={() => setFilterPeriod('threshold')}
          className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
            ${
              filterPeriod === 'threshold'
                ? 'bg-metropolia-main-orange text-white shadow-md scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-metropolia-main-orange hover:text-metropolia-main-orange'
            }`}>
          {t('common:belowThreshold', {threshold})}
        </button>
      )}
    </div>
  );
};
