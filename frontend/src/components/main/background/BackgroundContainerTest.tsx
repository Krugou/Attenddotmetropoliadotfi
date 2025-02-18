import React, {ReactNode, useEffect, useState} from 'react';

import Footer from '../../../views/Footer';
import Header from '../../../views/Header';
/**
 * Props for the BackgroundContainer component.
 */
interface BackgroundContainerProps {
  children: ReactNode;
  colors?: string[]; // Optional array of colors for the circles
}

/**
 * Generates a random circle SVG background.
 */
const specifiedColors = [
  'rgba(255, 151, 120, 0.5)', // Atomic Tangerine
  'rgba(255, 107, 120, 0.5)', // Light Red
  'rgba(255, 94, 122, 0.5)', // Bright Pink Crayola
  'rgba(255, 142, 64, 0.5)', // Orange Wheel
];
const generateRandomCirclesBackground = (colors: string[]): string => {
  const svgWidth = 1920;
  const svgHeight = 1080;

  const now = new Date();
  const numCircles = now.getHours() * 4; // Number of circles based on the current hour (0-23)
  const minRadius = now.getDate() * 2; // Minimum radius based on the current day of the month (1-31)
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const daysPassed = Math.floor(diff / oneDay);
  const maxRadius = daysPassed * 3; // Maximum radius based on the number of days passed in the current year

  const circles: string[] = [];

  for (let i = 0; i < numCircles; i++) {
    const radius = Math.random() * (maxRadius - minRadius) + minRadius;
    const cx = Math.random() * svgWidth;
    const cy = Math.random() * svgHeight;
    const fill = colors[Math.floor(Math.random() * colors.length)];
    circles.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" />`,
    );
  }

  const svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f2efed" />
    ${circles.join('')}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * A container component that displays a random background image and includes a header and footer.
 */
const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  colors,
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

  useEffect(() => {
    const url = generateRandomCirclesBackground(colors || specifiedColors);
    setBackgroundUrl(url);
  }, [colors]);

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <main
        className='flex flex-col items-center grow p-2 bg-center bg-cover sm:p-10'
        style={{backgroundImage: `url(${backgroundUrl})`}}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default BackgroundContainer;
