import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useRegisterSW} from 'virtual:pwa-register/react';
import {UserProvider} from './contexts/UserContext.tsx';
import AllRoutes from './routes/AllRoutes.tsx';

// Interval for service worker updates (1 hour)
const intervalMS = 60 * 60 * 1000;

/**
 * Main application component.
 */
const App = () => {
  // Register service worker with enhanced dev mode support
  useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('Service worker registered successfully');
        // Update service worker periodically
        setInterval(() => {
          console.log('Checking for service worker updates');
          r.update().catch(console.error);
        }, intervalMS);
      } else {
        const isDev = import.meta.env.MODE === 'development';
        if (isDev) {
          console.log('Service worker not registered (DEV mode)');
        } else {
          console.warn('Service worker registration failed');
          toast.warn('Offline functionality may be limited');
        }
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
      toast.error('Failed to enable offline functionality');
    },
  });

  return (
    <UserProvider>
      <ToastContainer hideProgressBar={true} />
      <Router basename={import.meta.env.BASE_URL}>
        <AllRoutes />
      </Router>
    </UserProvider>
  );
};

export default App;
