import {useState, useEffect} from 'react';

/**
 * A React hook that detects whether the current viewport width is below a specified breakpoint
 *
 * @param breakpoint - The width threshold in pixels to determine mobile view (default: 768px)
 * @returns boolean - True if the viewport width is less than the breakpoint
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isMobile = useIsMobile(768);
 *
 *   return (
 *     <div>
 *       {isMobile ? 'Mobile View' : 'Desktop View'}
 *     </div>
 *   );
 * }
 * ```
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
