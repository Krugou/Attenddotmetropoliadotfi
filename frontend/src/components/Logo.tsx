import React from 'react';
import '../css/logo.css';
/**
 * Logo component.
 * This component is responsible for rendering the logo of the application.
 * It includes a div with class "logo" that contains the logo design, and a paragraph that contains the name of the application.
 * The logo design is made up of nested divs with various classes to apply the necessary CSS styles.
 * The name of the application is styled with various Tailwind CSS classes.
 *
 * @returns {JSX.Element} The rendered Logo component.
 */
const Logo = () => {
  return (
    <div>
      <div className='p-2 m-4 logo'>
        <div className='oval-shape bg-metropolia-main-orange dark:bg-metropolia-main-orange-dark'>
          <div className='big-brother-eye'>
            <div className='eye'></div>
          </div>
        </div>
      </div>

      <p className='p-2 m-2 text-4xl subpixel-antialiased tracking-widest text-center font-heading'>
        JakSec
      </p>
    </div>
  );
};

export default Logo;
