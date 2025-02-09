import React from 'react';
import {useTranslation} from 'react-i18next';

const AdminLogsTable = ({
  logs,
  handleShowMore,
  handleReset,
  lineLimit,
  logType,
}) => {
  const {t} = useTranslation(['translation']);

  return (
    <div className='flex flex-col justify-center w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
      <h1 className='mb-6 text-xl text-center sm:text-2xl md:text-3xl font-heading'>
        {logType === 'error'
          ? t('admin.logs.errorTitle')
          : t('admin.logs.title')}
      </h1>

      <div className='flex flex-col items-center justify-center w-full p-3 mb-4 rounded-lg shadow-xs sm:p-4 bg-metropolia-support-white'>
        <div className='flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4'>
          <button
            onClick={handleShowMore}
            className={`w-full sm:w-auto font-heading py-2 px-4 rounded-md transition-colors duration-200 ${
              lineLimit >= 500
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
            }`}
            disabled={lineLimit >= 5000}>
            {t('translation:admin.logs.showOlder')}{' '}
            {logType === 'error'
              ? t('admin.logs.errorLogsLabel')
              : t('admin.logs.logsLabel')}
          </button>
          <button
            onClick={handleReset}
            className='w-full px-4 py-2 text-white transition-colors duration-200 bg-red-500 rounded-md sm:w-auto font-heading hover:bg-red-600 active:bg-red-700'>
            {t('translation:admin.logs.resetReload')}
          </button>
        </div>
      </div>

      <div className='grow'>
        {logs.length === 0 ? (
          <p className='py-8 text-center text-gray-600'>
            {logType === 'error'
              ? t('admin.logs.noErrorLogs')
              : t('admin.logs.noLogs')}
          </p>
        ) : (
          <>
            <h2 className='p-3 mb-4 text-base text-white rounded-lg shadow-xs sm:p-4 bg-slate-500 sm:text-lg'>
              {logType === 'error'
                ? t('admin.logs.errorLogsLabel')
                : t('admin.logs.logsLabel')}
            </h2>

            <div className='mb-8 space-y-4'>
              {logs.map((log, index) => {
                try {
                  const parsedLog = JSON.parse(log.line);
                  return (
                    <div
                      key={index}
                      className='flex flex-col justify-between p-3 text-black transition-colors duration-200 bg-white border rounded-lg shadow-xs sm:p-4 hover:bg-gray-50'>
                      <div
                        className={`flex flex-col sm:flex-row ${
                          parsedLog.useremail
                            ? 'justify-between'
                            : 'justify-end'
                        } gap-2 sm:gap-0`}>
                        {parsedLog.useremail && (
                          <div className='text-sm break-all sm:text-base'>
                            <span className='font-medium'>
                              {t('translation:admin.logs.details.userEmail')}:
                            </span>{' '}
                            {parsedLog.useremail}
                          </div>
                        )}
                        <div className='text-sm text-gray-600 sm:text-base whitespace-nowrap'>
                          <span className='font-medium'>
                            {t('translation:admin.logs.details.time')}:
                          </span>{' '}
                          {new Date(parsedLog.time).toLocaleString()}
                        </div>
                      </div>
                      <div className='mt-2 text-sm break-words sm:text-base'>
                        <span className='font-medium'>
                          {t('translation:admin.logs.details.message')}:
                        </span>{' '}
                        {parsedLog.msg}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error(`Error parsing log line: ${log.line}`, error);
                  return null;
                }
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogsTable;
