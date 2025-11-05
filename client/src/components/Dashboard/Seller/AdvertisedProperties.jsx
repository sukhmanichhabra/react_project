import React, { useState } from "react";
import AdvertisedPropertyCard from "./AdvertisedPropertyCard";
import "./AdvertisedProperties.css"; // <-- Import new CSS

// 1. Mock data added
const mockAdProperty = {
  _id: "ad-mock-1",
  images: ["/assets/property-1.jpg"],
  title: "Premium Villa Listing (Mock)",
  location: "Premium Location, Mock City",
  price: "$500,000",
  features: { beds: 4, baths: 3, sqft: 2500 },
  status: "active",
  adPackage: {
    name: "Gold Package",
    startDate: "2025-10-01T00:00:00Z",
    endDate: "2025-11-30T00:00:00Z",
  }
};

const AdvertisedProperties = ({ advertisedProperties = [] }) => {
  // 2. Combined mock data with prop data in state
  const [properties, setProperties] = useState([mockAdProperty, ...advertisedProperties]);

  const handleCancel = (propertyId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this advertising package?"
      )
    ) {
      console.log(`Canceling package for ${propertyId}`);
      // API call to cancel
      setProperties(properties.filter((p) => p._id !== propertyId));
    }
  };

  return (
    <section
      id="advertised-properties"
      className="advertised-properties-section"
    >
      <div className="advertised-properties-header">
        <h2>Advertised Properties</h2>
        <p>Manage your active advertising packages.</p>
      </div>
      <div className="advertised-properties-grid">
        {properties.length > 0 ? (
          properties.map((prop) => (
            <AdvertisedPropertyCard
              key={prop._id}
              property={prop}
              isAdmin={false}
              onCancel={handleCancel}
            />
          ))
        ) : (
          // Using the shared 'dash-empty-state' class
          <div className="dash-empty-state">
            <i className="fas fa-ad"></i>
            <h3>No Advertised Properties</h3>
            <p>You have not purchased any advertising packages.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdvertisedProperties;