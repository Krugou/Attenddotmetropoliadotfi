import React from 'react';
import {useTranslation} from 'react-i18next';

interface TeamMember {
  name: string;
  highlight?: string;
  role: string;
  github: string;
}

/**
 * Team component displays information about the development team
 * using a responsive and animated card layout
 */
const Team: React.FC = () => {
  const {t} = useTranslation();

  const originalTeam: TeamMember[] = [
    {
      name: 'Joonas Lamminmäki',
      highlight: 'J',
      role: t('team.roles.originalDev'),
      github: 'https://github.com/Jonsson-123',
    },
    {
      name: 'Aleksi Nokelainen',
      highlight: 'A',
      role: t('team.roles.originalDev'),
      github: 'https://github.com/Krugou',
    },
    {
      name: 'Kaarle Häyhä',
      highlight: 'K',
      role: t('team.roles.originalDev'),
      github: 'https://github.com/KaarleH',
    },
  ];

  const additionalTeam: TeamMember[] = [
    {
      name: 'Nestori Laine',
      role: t('team.roles.additionalDev'),
      github: 'https://github.com/Aihki',
    },
    {
      name: 'Aleksi Nokelainen',
      role: t('team.roles.additionalDev'),
      github: 'https://github.com/Krugou',
    },
  ];

  return (
    <div className='container max-w-6xl px-4 py-8 mx-auto'>
      <div className='p-8 bg-white shadow-lg rounded-xl'>
        <h1 className='mb-8 text-4xl text-center font-heading text-metropoliaMainOrange'>
          {t('team.title')}
        </h1>

        <div className='mb-12'>
          <h2 className='mb-6 text-2xl text-center text-gray-700 font-heading'>
            {t('team.originalTeam')}
          </h2>
          <div className='grid gap-6 md:grid-cols-3'>
            {originalTeam.map((member, index) => (
              <div
                key={index}
                className='p-6 transition-all duration-300 border-2 rounded-lg hover:shadow-xl hover:scale-105'>
                <div className='text-2xl text-center text-gray-700 font-body'>
                  {member.highlight && (
                    <span className='font-bold text-metropoliaMainOrange'>
                      {member.highlight}
                    </span>
                  )}
                  {member.name.substring(1)}
                </div>
                <div className='mt-2 text-sm text-center text-gray-500'>
                  {member.role}
                </div>
                <a
                  href={member.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block mt-2 text-sm text-center transition-colors duration-200 text-metropoliaMainOrange hover:text-metropoliaMainGrey'>
                  {t('team.viewGithub')}
                </a>
              </div>
            ))}
          </div>
          <p className='mt-4 text-center text-gray-500 font-body'>
            {t('team.jakDescription')}
          </p>
        </div>

        <div className='mt-8'>
          <h2 className='mb-6 text-2xl text-center text-gray-700 font-heading'>
            {t('team.additionalTeam')}
          </h2>
          <div className='grid gap-6 mx-auto md:grid-cols-2'>
            {additionalTeam.map((member, index) => (
              <div
                key={index}
                className='p-6 transition-all duration-300 border-2 rounded-lg hover:shadow-xl hover:scale-105'>
                <div className='text-2xl text-center text-gray-700 font-body'>
                  {member.name}
                </div>
                <div className='mt-2 text-sm text-center text-gray-500'>
                  {member.role}
                </div>
                <a
                  href={member.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block mt-2 text-sm text-center transition-colors duration-200 text-metropoliaMainOrange hover:text-metropoliaMainGrey'>
                  {t('team.viewGithub')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
