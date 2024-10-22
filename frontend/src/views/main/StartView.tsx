import React from 'react';
import Logo from '../../components/Logo';
import ServerStatus from '../../components/main/ServerStatus';
import StartViewButton from '../../components/main/buttons/StartViewButton';

/**
 * StartView component.
 *
 * This component is responsible for rendering the start view of the application.
 * It displays the application logo, a start view button, and the server status.
 *
 * @returns {JSX.Element} The rendered StartView component.
 */
const StartView = () => {
  return (
    <div className='flex flex-col items-center justify-center pt-10 logo-container'>
      <Logo />
      <div className='flex flex-col items-center p-4 m-4 md:flex-row'>
        <StartViewButton />
      </div>
      <ServerStatus />
    </div>
  );
};

export default StartView;
