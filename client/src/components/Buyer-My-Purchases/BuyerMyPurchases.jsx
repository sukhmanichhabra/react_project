import { useEffect } from 'react';
import MyPropertiesSection from './MyPropertiesSection';
import RentedPropertiesSection from './RentedPropertiesSection';
import './BuyerMyPurchases.css';

const BuyerMyPurchases = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="buyer-purchases-wrapper">
      <MyPropertiesSection />
      <RentedPropertiesSection />
    </div>
  );
};

export default BuyerMyPurchases;
