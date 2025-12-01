import { useEffect } from 'react';
import LeftMenu from './LeftMenu';
import FAQSections from './FAQSections';
import BackToTop from './BackToTop';
import './FAQ.css';

const FAQ = () => {
  useEffect(() => {
    // Only scroll to top, don't use setTimeout which might interfere with hash navigation
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <div className="faq-wrapper">
        <div className="faq-content">
          <LeftMenu />
          <FAQSections />
        </div>
      </div>
      <BackToTop />
    </>
  );
};

export default FAQ;
