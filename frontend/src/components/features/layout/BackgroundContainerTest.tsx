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

    // orange warmth
    'radial-gradient(900px 650px at 18% 30%, rgba(255, 132, 64, 0.26), transparent 62%)',

    // pink/coral wash
    'radial-gradient(900px 750px at 78% 58%, rgba(255, 107, 140, 0.24), transparent 65%)',

    // a slightly cooler counter-tone
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

        {/* Grain overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            filter: 'url(#grain)',
            opacity: 0.28, // <-- increase to 0.35 if you want more texture
            mixBlendMode: 'multiply',
          }}
        />

        {/* A soft highlight “mist” behind the top nav*/}
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
