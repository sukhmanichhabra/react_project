import { useEffect } from 'react';

const LeftMenu = () => {
  useEffect(() => {
    const menuLinks = document.querySelectorAll('.menu-list a');
    
    menuLinks.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('href');
        document.querySelector(sectionId).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });

    const observerOptions = {
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.menu-list a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });

    return () => {
      menuLinks.forEach(anchor => {
        anchor.removeEventListener('click', function() {});
      });
      document.querySelectorAll('.section').forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="container left-container">
      <ul className="menu-list">
        <li><a href="#selling"><i className="fas fa-home"></i> Selling</a></li>
        <li><a href="#renting"><i className="fas fa-key"></i> Renting</a></li>
        <li><a href="#buying"><i className="fas fa-shopping-cart"></i> Buying</a></li>
        <li><a href="#payments"><i className="fas fa-credit-card"></i> Payments</a></li>
        <li><a href="#terms"><i className="fas fa-file-contract"></i> Terms & Conditions</a></li>
        <li><a href="#account"><i className="fas fa-user"></i> Account</a></li>
      </ul>

      <div className="contact-section">
        <h2>Don't Find Your Answer?</h2>
        <button className="contact-btn"><i className="fas fa-envelope"></i> Contact us</button>
      </div>
    </div>
  );
};

export default LeftMenu;
