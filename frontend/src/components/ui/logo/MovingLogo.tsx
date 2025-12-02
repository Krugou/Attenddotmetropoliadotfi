import React from 'react';
import metropoliaLogo from '../../../assets/images/metropolia_s_musta_en.png';
import '../../../css/logo.css';

const MovingLogo = () => (
  <div className='w-1/12 p-2 m-4 logo animate-pulse'>
    <img className='' src={metropoliaLogo} alt='Metropolia Logo' />
  </div>
);

export default MovingLogo;
