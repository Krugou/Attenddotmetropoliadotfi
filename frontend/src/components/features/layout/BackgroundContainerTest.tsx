import React, { ReactNode } from 'react';
import Footer from '../../../views/Footer.tsx';
import Header from '../../../views/Header.tsx';

interface BackgroundContainerProps {
  children: ReactNode;
}

/**
 * New background:
 * - Professional but clearly colorful
 * - "Producty" and intentional
 * - Warm neutral base so cards still pop
 * - Orange stays as accent (not the whole screen)
 * - Subtle but visible grain for character
 */
const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children }) => {
  // Warm neutral base (matches your UI greys, but less dead)
  const base = '#F2EFED';

  // Color wash / "field" gradients (large, soft, intentional)
  // NOTE: This is where you can tune intensity:
  // - increase alpha values (0.18 -> 0.24) for more color
  // - move positions if you want different composition
  const background = [
    // soft vignette to frame content
    'radial-gradient(1200px 900px at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,18,16,0.10) 100%)',

    // orange warmth (brand-adjacent, but not screaming)
    'radial-gradient(900px 650px at 18% 30%, rgba(255, 132, 64, 0.22), transparent 62%)',

    // pink/coral wash (adds personality)
    'radial-gradient(900px 750px at 78% 58%, rgba(255, 107, 140, 0.18), transparent 65%)',

    // a slightly cooler counter-tone (very subtle, keeps it modern)
    'radial-gradient(1000px 800px at 55% 15%, rgba(120, 160, 255, 0.08), transparent 60%)',

    // base paper
    `linear-gradient(180deg, ${base} 0%, #F7F3F1 40%, ${base} 100%)`,
  ].join(', ');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main
        className="relative flex flex-col items-center grow overflow-x-hidden
                   px-2 sm:px-4 lg:px-8
                   pt-4 sm:pt-6
                   pb-6 sm:pb-10"
        style={{ backgroundImage: background }}
      >
        {/* Grain filter definition (inline SVG -> no CSP/data-uri issues) */}
        <svg aria-hidden="true" className="pointer-events-none absolute w-0 h-0">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="1"
              seed="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.18 0
              "
            />
          </filter>
        </svg>

        {/* Grain overlay (intentional texture) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            filter: 'url(#grain)',
            opacity: 0.28, // <-- increase to 0.35 if you want more texture
            mixBlendMode: 'multiply',
          }}
        />

        {/* A soft highlight “mist” behind the top nav area so it feels premium */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
          style={{
            background:
              'radial-gradient(900px 220px at 50% 40%, rgba(255,255,255,0.55), transparent 70%)',
            mixBlendMode: 'soft-light',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BackgroundContainer;

/*import React, {ReactNode, useEffect, useState} from 'react';

import Footer from '../../../views/Footer.tsx';
import Header from '../../../views/Header.tsx';
/**
 * Props for the BackgroundContainer component.
 */
/*interface BackgroundContainerProps {
  children: ReactNode;
  colors?: string[]; // Optional array of colors for the circles
}

/**
 * This system generates random decorative circles based on calendar data for a dynamic SVG background.
 * The randomization is deterministic based on time factors:
 *
 * - Number of circles: Based on the current hour (hours * 2), creating more circles later in the day
 * - Minimum circle radius: Based on the current day of month (day * 2), larger minimums later in month
 * - Maximum circle radius: Based on days passed in current year (daysPassed * 3), creating larger potential circles as year progresses
 *
 * Circle positions (cx, cy) are fully randomized within the viewport dimensions.
 * Circle colors are randomly selected from the provided colors array (or defaults to specifiedColors).
 *
 * This approach creates a visually interesting pattern that subtly changes throughout the day and
 * evolves throughout the month/year while maintaining performance through controlled circle counts.
 */
/*const specifiedColors = [
  'rgba(255, 151, 120, 0.5)', // Atomic Tangerine
  'rgba(255, 107, 120, 0.5)', // Light Red
  'rgba(255, 94, 122, 0.5)', // Bright Pink Crayola
  'rgba(255, 142, 64, 0.5)', // Orange Wheel
];
const generateRandomCirclesBackground = (
  colors: string[],
  width: number,
  height: number,
): string => {
  const svgWidth = width;
  const svgHeight = height;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const daysPassed = Math.floor(diff / oneDay);
  const numCircles = now.getHours() * 2; // Number of circles based on the current hour (0-23)
  const minRadius = now.getDate() * 2; // Minimum radius based on the current day of the month (1-31)
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

const debounce = (func: (...args: any[]) => void, wait: number) => {
  // @ts-expect-error setTimeout returns a number, not a Timeout object
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * A container component that displays a random background image and includes a header and footer.
 */
/*const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  colors,
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState<{width: number; height: number}>(
    {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  );

  useEffect(() => {
    const handleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 1500);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const url = generateRandomCirclesBackground(
      colors || specifiedColors,
      dimensions.width,
      dimensions.height,
    );
    setBackgroundUrl(url);
  }, [colors, dimensions]);

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <main
        className="flex flex-col items-center grow bg-center bg-cover
                   px-2 sm:px-4 lg:px-8
                   pt-4 sm:pt-6
                   pb-6 sm:pb-10"
        style={{backgroundImage: `url(${backgroundUrl})`}}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default BackgroundContainer;*/
