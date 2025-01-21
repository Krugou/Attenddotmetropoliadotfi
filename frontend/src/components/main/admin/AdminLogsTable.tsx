import React from 'react';

const AdminLogsTable = ({
  logs,
  handleShowMore,
  handleReset,
  lineLimit,
  logType,
}) => {
  return (
    <div className='flex flex-col justify-center px-4 md:px-0'>
      <h1 className='mb-4 text-2xl font-heading text-center'>
        Admin {logType === 'error' ? 'Error Logs' : 'Logs'}
      </h1>
      <div className='flex flex-col items-center justify-center w-full p-2 mb-4 bg-metropoliaSupportWhite md:mb-0'>
        <div className='flex flex-col items-center justify-center md:flex-row'>
          <button
            onClick={handleShowMore}
            className={`m-4 font-heading py-2 px-4 rounded ${
              lineLimit >= 500
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            disabled={lineLimit >= 5000}>
            Show older {logType === 'error' ? 'error logs' : 'Logs:'}
          </button>
          <button
            onClick={handleReset}
            className='px-4 py-2 m-2 font-heading text-white bg-red-500 rounded hover:bg-red-700'>
            Reset/Reload
          </button>
        </div>
      </div>
      <div className='flex-grow p-2 '>
        {logs.length === 0 ? (
          <p>no {logType === 'error' ? 'Error Logs' : 'Logs:'} found.</p>
        ) : (
          <>
            <h2 className='p-4 m-2 text-white border rounded  bg-slate-500'>
              {logType === 'error' ? 'Error Logs:' : 'Logs:'}
            </h2>

            <div className='flex flex-col items-center justify-center p-4 m-6'>
              <div className='overflow-x-auto '>
                <div className='overflow-auto divide-y divide-gray-200 h-1/2'>
                  {logs.map((log, index) => {
                    try {
                      const parsedLog = JSON.parse(log.line);
                      return (
                        <div
                          key={index}
                          className='flex flex-col justify-between p-2 text-black bg-white border rounded-lg hover:bg-black hover:text-white'>
                          <div
                            className={`flex ${
                              parsedLog.useremail
                                ? 'justify-between'
                                : 'justify-end'
                            }`}>
                            {parsedLog.useremail && (
                              <div className='p-2 text-sm '>
                                User Email: {parsedLog.useremail}
                              </div>
                            )}
                            <div className='mx-2 text-sm text-right whitespace-nowrap'>
                              Time: {new Date(parsedLog.time).toLocaleString()}
                            </div>
                          </div>
                          <div className='max-w-xs p-1 overflow-hidden text-xs text-left  md:p-2 lg:p-4 sm:text-sm md:text-base text-overflow-ellipsis sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'>
                            Message: {parsedLog.msg}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error(
                        `Error parsing log line: ${log.line}`,
                        error,
                      );
                      return null;
                    }
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogsTable;
