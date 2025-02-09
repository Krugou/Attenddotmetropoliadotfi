import React, {ReactNode, useEffect, useState} from 'react';
import tausta1 from '../../../assets/images/tausta1.png';
import tausta2 from '../../../assets/images/tausta2.png';
import tausta3 from '../../../assets/images/tausta3.png';
import tausta4 from '../../../assets/images/tausta4.png';
import tausta5 from '../../../assets/images/tausta5.png';
import Footer from '../../../views/Footer';
import Header from '../../../views/Header';
/**
 * Props for the BackgroundContainer component.
 */
interface BackgroundContainerProps {
  children: ReactNode;
}

const backgrounds = [tausta1, tausta2, tausta3, tausta4, tausta5];
/**
 * Returns a random background URL from the available backgrounds.
 */
const getRandomBackgroundUrl = (): string => {
  const randomNumber = Math.floor(Math.random() * backgrounds.length);
  return backgrounds[randomNumber];
};
/**
 * A container component that displays a random background image and includes a header and footer.
 */
const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
}) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

  useEffect(() => {
    const url = getRandomBackgroundUrl();
    setBackgroundUrl(url);
  }, []); // The empty dependency array ensures this effect runs only once on mount

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
