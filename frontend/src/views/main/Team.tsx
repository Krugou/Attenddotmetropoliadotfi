import React from 'react';

const Team: React.FC = () => {
  return (
    <div className='flex flex-col items-center p-4 m-4 bg-white border-2 border-gray-200 rounded-md shadow-lg justify-evenly h-1/2'>
      <h1 className='mb-4 text-4xl font-bold text-metropoliaMainOrange'>
        Original Development Team
      </h1>
      <div className='flex flex-col gap-2 mb-4 text-3xl text-gray-700 md:flex-row font-regular'>
        <div className='p-4 border-2 rounded-md'>
          <strong>J</strong>oonas Lamminmäki.
        </div>
        <div className='p-4 border-2 rounded-md'>
          <strong>A</strong>leksi Nokelainen.
        </div>
        <div className='p-4 border-2 rounded-md'>
          <strong>K</strong>aarle Häyhä.
        </div>
      </div>

      <p className='text-gray-500'>The initials form the acronym "JAK".</p>
      <div>
        <div className='mt-4'>
          <h2 className='mb-4 text-3xl font-bold text-metropoliaMainOrange'>
            Additional Development
          </h2>
          <div className='p-4 text-3xl text-gray-700 border-2 rounded-md font-regular'>
            Nestori Laine
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
