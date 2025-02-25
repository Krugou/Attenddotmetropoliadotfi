import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import AdminLogsTable from '../../../../components/main/admin/AdminLogsTable';
import apiHooks from '../../../../api';
import {Tab} from '@headlessui/react';
import {useMediaQuery} from 'react-responsive';

interface LogEntry {
  lineNumber: number;
  line: string;
}

const AdminLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [lineLimit, setLineLimit] = useState(100);
  const [regularLogs, setRegularLogs] = useState<LogEntry[]>([]);
  const [errorLogs, setErrorLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  const isDesktop = useMediaQuery({minWidth: 768});

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
        // Fetch both log types simultaneously
        const [regularLogsResult, errorLogsResult] = await Promise.all([
          apiHooks.fetchLogs(token, lineLimit),
          apiHooks.fetchErrorLogs(token, lineLimit),
        ]);

        if (
          !Array.isArray(regularLogsResult) ||
          !Array.isArray(errorLogsResult)
        ) {
          toast.error('Expected arrays from log fetch operations');
          setIsLoading(false);
          return;
        }

        // Filter and set regular logs
        const filteredRegularLogs = regularLogsResult
          .filter((log) => log.line.trim() !== '')
          .reverse();
        setRegularLogs(filteredRegularLogs);

        // Filter and set error logs
        const filteredErrorLogs = errorLogsResult
          .filter((log) => log.line.trim() !== '')
          .reverse();
        setErrorLogs(filteredErrorLogs);
      } catch (error) {
        toast.error('Error fetching logs');
        console.error('Log fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(getLogs, 500);
    const intervalId = setInterval(getLogs, 2 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [lineLimit, trigger]);

  const handleShowMore = () => {
    if (lineLimit < 500) {
      setIsLoading(true);
      setLineLimit(lineLimit + 100);
    } else {
      toast.info('Maximum log limit reached (500 lines)');
    }
  };

  const handleReset = () => {
    setLineLimit(100);
    setTrigger((prevTrigger) => prevTrigger + 1);
  };

  const renderLoading = () => (
    <div className='flex items-center justify-center p-12'>
      <div className='w-16 h-16 border-t-2 border-b-2 border-metropolia-main-orange rounded-full animate-spin'></div>
    </div>
  );

  return (
    <div className='w-full bg-white shadow-md rounded-lg overflow-hidden'>
      <div className='p-4'>
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className='flex space-x-1 rounded-xl bg-metropolia-main-grey-dark/10 p-1 mb-4'>
            <Tab
              className={({selected}) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-metropolia-main-grey
                ${
                  selected
                    ? 'bg-white shadow font-bold text-metropolia-main-orange'
                    : 'hover:bg-white/[0.12]'
                }`
              }>
              Regular Logs
            </Tab>
            <Tab
              className={({selected}) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-metropolia-main-grey
                ${
                  selected
                    ? 'bg-white shadow font-bold text-metropolia-support-red'
                    : 'hover:bg-white/[0.12]'
                }`
              }>
              Error Logs
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              {isLoading ? (
                renderLoading()
              ) : (
                <AdminLogsTable
                  logs={regularLogs}
                  handleShowMore={handleShowMore}
                  handleReset={handleReset}
                  lineLimit={lineLimit}
                  logType='logs'
                  isDesktop={isDesktop}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {isLoading ? (
                renderLoading()
              ) : (
                <AdminLogsTable
                  logs={errorLogs}
                  handleShowMore={handleShowMore}
                  handleReset={handleReset}
                  lineLimit={lineLimit}
                  logType='error'
                  isDesktop={isDesktop}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AdminLogs;
