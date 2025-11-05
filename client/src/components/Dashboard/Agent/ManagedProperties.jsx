import React from "react";
import SimplePropertyCard from "../common/PropertyCard"; // Assuming this is the correct path
import "./ManagedProperties.css";

// 1. Mock data added
const mockProperty = {
  _id: "managed-mock-1",
  images: ["/assets/property-4.jpg"], // Example image
  tag: "sale",
  status: "approved",
  title: "Modern City Loft (Mock)",
  location: "123 Main St, Metro City",
  beds: 2,
  baths: 2,
  sqft: 1100,
  price: "$420,000",
};

const ManagedProperties = ({ properties = [] }) => {
  // 2. Combined mock data with prop data
  const allProperties = [mockProperty, ...properties];

  return (
    <section id="managed-properties" className="managed-properties-section">
      <div className="managed-properties-header">
        <h2>Properties I Manage</h2>
        <p>An overview of all properties assigned to you.</p>
      </div>
      <div className="managed-properties-grid">
        {allProperties.length > 0 ? (
          // 3. Mapped over the combined array
          allProperties.map((prop) => (
            <SimplePropertyCard key={prop._id} property={prop} />
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-building"></i>
            <h3>No Properties Yet</h3>
            <p>You have not been assigned any properties to manage.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManagedProperties;
