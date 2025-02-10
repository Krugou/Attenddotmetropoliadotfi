import React, {useState} from 'react';
import '../css/logo.css';

/**
 * Logo component.
 * This component is responsible for rendering the logo of the application.
 * It includes a div with class "logo" that contains the logo design, and a paragraph that contains the name of the application.
 * The logo design is made up of nested divs with various classes to apply the necessary CSS styles.
 * The name of the application is styled with various Tailwind CSS classes.
 * Clicking on the logo triggers a "crazy eye" animation.
 *
 * @returns {JSX.Element} The rendered Logo component.
 */
const Logo = () => {
  const [isCrazy, setIsCrazy] = useState(false);

  const handleClick = () => {
    setIsCrazy(true);
    // Reset the crazy state after animation ends
    setTimeout(() => setIsCrazy(false), 2000);
  };

  return (
    <div>
      <div className='p-2 m-4 logo' onClick={handleClick}>
        <div className='oval-shape bg-metropolia-main-orange dark:bg-metropolia-main-orange-dark'>
          <div className={`big-brother-eye ${isCrazy ? 'crazy' : ''}`}>
            <div className={`eye ${isCrazy ? 'crazy' : ''}`}></div>
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
