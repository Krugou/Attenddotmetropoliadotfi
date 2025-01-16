import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import AdminLogsTable from '../../../components/main/admin/AdminLogsTable';
import apiHooks from '../../../hooks/ApiHooks';


const AdminLogs = () => {
  const [lineLimit, setLineLimit] = useState(100);
  const [logs, setLogs] = useState<{lineNumber: number; line: string}[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const getLogs = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('No token available');
        setIsLoading(false);
        return;
      }

      try {
        let logsResult = await apiHooks.fetchLogs(token, lineLimit);

        if (!Array.isArray(logsResult)) {
          toast.error('Expected an array from fetchLogs and fetchErrorLogs');
          setIsLoading(false);
          return;
        }
        logsResult = logsResult.filter((log) => log.line.trim() !== '');

        setLogs(logsResult.reverse());
      } catch (error) {
        toast.error('Error fetching logs');
      }

      setIsLoading(false);
    };

    // Wait for 2 seconds before fetching logs
    const timeoutId = setTimeout(getLogs, 500);
    // Then fetch logs every 2 minutes
    const intervalId = setInterval(getLogs, 2 * 60 * 1000);
    // Clear the timeout if the component is unmounted or lineLimit changes
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [lineLimit, trigger]);
  const handleShowMore = () => {
    if (lineLimit < 500) {
      setIsLoading(true);
      setLineLimit(lineLimit + 100);
    }
  };

  const handleReset = () => {
    setLineLimit(100);
    setTrigger((prevTrigger) => prevTrigger + 1);
  };
  return (
    <div className='w-full p-4 m-1 bg-white'>
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <div className='w-32 h-32 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin'></div>
        </div>
      ) : (
        <AdminLogsTable
          logs={logs}
          handleShowMore={handleShowMore}
          handleReset={handleReset}
          lineLimit={lineLimit}
          logType='logs'
        />
      )}
    </div>
  );
};

export default AdminLogs;
