import React from 'react';
import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
interface AdminLogsTableProps {
  logs: {lineNumber: number; line: string}[];
  handleShowMore: () => void;
  handleReset: () => void;
  lineLimit: number;
  logType: 'logs' | 'error';
  isDesktop: boolean;
}

const AdminLogsTable: React.FC<AdminLogsTableProps> = ({
  logs,
  handleShowMore,
  handleReset,
  lineLimit,
  logType,
  isDesktop,
}) => {
  const {t} = useTranslation(['admin']);

  const getSeverity = (line: string): string => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error')) return 'bg-red-100 text-red-800';
    if (lowerLine.includes('warning')) return 'bg-yellow-100 text-yellow-800';
    if (lowerLine.includes('info')) return 'bg-blue-100 text-blue-800';
    return '';
  };

  const getFormattedLine = (line: string): JSX.Element => {
    // Extract timestamp if it exists
    const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    const timestamp = timestampMatch ? timestampMatch[0] : '';

    // Extract log level if it exists
    const levelMatch = line.match(/(ERROR|WARNING|INFO|DEBUG|error|warning|info|debug)/i);
    const level = levelMatch ? levelMatch[0].toUpperCase() : '';

    // Get remaining content after timestamp and level
    let content = line;
    if (timestamp) {
      content = content.replace(timestamp, '');
    }
    if (level) {
      content = content.replace(new RegExp(level, 'i'), '');
    }
    content = content.replace(/\[\d+m|\[\d+;\d+m/g, ''); // Remove ANSI color codes

    return (
      <>
        {timestamp && <span className='text-gray-500 mr-2'>{timestamp}</span>}
        {level && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
              level === 'ERROR'
                ? 'bg-metropolia-support-red text-white'
                : level === 'WARNING'
                ? 'bg-metropolia-support-yellow text-black'
                : 'bg-metropolia-support-blue text-white'
            }`}>
            {level}
          </span>
        )}
        <span>{content}</span>
      </>
    );
  };

  if (isDesktop) {
    return (
      <div className='overflow-hidden'>
        <div className='mb-4 flex justify-between items-center'>
          <h2 className='text-xl font-heading font-semibold'>
            {logType === 'error' ? 'Error Logs' : 'System Logs'}
            <span className='text-sm font-normal ml-2'>
              (Showing {logs.length} of {lineLimit} lines)
            </span>
          </h2>
          <div className='space-x-2'>
            <button
              onClick={handleReset}
              className='px-4 py-2 bg-metropolia-main-grey text-white rounded hover:bg-metropolia-main-grey-dark transition-colors'>
              Refresh
            </button>
            <button
              onClick={handleShowMore}
              disabled={lineLimit >= 500}
              className={`px-4 py-2 rounded transition-colors ${
                lineLimit >= 500
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-metropolia-main-orange text-white hover:bg-metropolia-main-orange-dark'
              }`}>
              Show More
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Line#
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Log Entry
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {logs.map((log) => (
                <tr key={log.lineNumber} className={getSeverity(log.line)}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {log.lineNumber}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900 font-mono whitespace-pre-wrap break-words max-w-[800px]'>
                    {getFormattedLine(log.line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lineLimit < 500 && (
          <div className='text-center mt-4'>
            <button
              onClick={handleShowMore}
              className='px-4 py-2 bg-metropolia-main-orange text-white rounded hover:bg-metropolia-main-orange-dark transition-colors'>
              Load More Logs
            </button>
          </div>
        )}
      </div>
    );
  } else {
    // Mobile view
    return (
      <div className='overflow-hidden'>
        <div className='mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
          <h2 className='text-lg font-heading font-semibold'>
            {logType === 'error' ? 'Error Logs' : 'System Logs'}
            <span className='text-xs font-normal ml-2'>
              ({logs.length}/{lineLimit})
            </span>
          </h2>
          <div className='w-full sm:w-auto flex gap-2'>
            <button
              onClick={handleReset}
              className='flex-1 sm:flex-none px-3 py-1 bg-metropolia-main-grey text-white text-sm rounded hover:bg-metropolia-main-grey-dark'>
              Refresh
            </button>
            <button
              onClick={handleShowMore}
              disabled={lineLimit >= 500}
              className={`flex-1 sm:flex-none px-3 py-1 text-sm rounded ${
                lineLimit >= 500
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-metropolia-main-orange text-white hover:bg-metropolia-main-orange-dark'
              }`}>
              Show More
            </button>
          </div>
        </div>

        <div className='space-y-4'>
          {logs.map((log) => (
            <div
              key={log.lineNumber}
              className={`p-3 rounded-md border ${
                getSeverity(log.line) || 'border-gray-200'
              }`}>
              <div className='flex justify-between items-center mb-1'>
                <span className='text-xs font-medium bg-gray-200 px-2 py-1 rounded'>
                  Line {log.lineNumber}
                </span>
              </div>
              <div className='text-sm font-mono break-words'>
                {getFormattedLine(log.line)}
              </div>
            </div>
          ))}
        </div>

        {lineLimit < 500 && logs.length > 0 && (
          <div className='text-center mt-4'>
            <button
              onClick={handleShowMore}
              className='w-full px-4 py-2 bg-metropolia-main-orange text-white rounded hover:bg-metropolia-main-orange-dark'>
              Load More Logs
            </button>
          </div>
        )}

        {logs.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            No logs available
          </div>
        )}
      </div>
    );
  }
};

export default AdminLogsTable;
