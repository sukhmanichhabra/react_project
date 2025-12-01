import { useState, useEffect } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      id="backToTop" 
      aria-label="Back to top"
      style={{ display: isVisible ? 'flex' : 'none' }}
      onClick={scrollToTop}
    >
      <a href="#top" aria-label="Scroll to top" onClick={(e) => e.preventDefault()}>
        <i className="fas fa-chevron-up"></i>
      </a>
    </button>
  );
};

export default BackToTop;
