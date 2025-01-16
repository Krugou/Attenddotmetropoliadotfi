// Importing necessary libraries and components
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Main application component
import './css/index.css'; // Global styles
import './utils/i18n'; 

// Rendering the main application component into the root element of the HTML document
ReactDOM.createRoot(document.getElementById('root')!).render(
  /**
   * Wrapping the App component in React's StrictMode.
   * StrictMode is a tool for highlighting potential problems in an application.
   * It does not render any visible UI, and activates additional checks and warnings for its descendants.
   */
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
