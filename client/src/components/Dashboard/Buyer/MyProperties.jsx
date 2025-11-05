import React from "react";
import { Link } from "react-router-dom";
import EnhancedPropertyCard from "../../partials/EnhancedPropertyCard";
import "./MyProperties.css";

// Mock data as requested
const mockProperty = {
  _id: "mock-1",
  images: [
    "https_images_unsplash_com_photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60", // Placeholder
  ],
  tag: "sale",
  title: "Luxury Flat in Koramangala",
  location: "Koramangala, Road no 3, Bengaluru, India.",
  beds: 4,
  baths: 3,
  sqft: 1200,
  price: 40000,
};

const MyProperties = ({ properties = [] }) => {
  // Combine mock data with API data
  const allProperties = [mockProperty, ...properties];

  // Helper function to map property data for enhanced card
  const mapPropertyToEnhancedCard = (property) => {
    return {
      id: property._id,
      propertyType: property.features?.type || "Property",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "RENTED" : "PURCHASED",
      location: `${property.location?.address || ''}, ${property.location?.city || ''}, ${property.location?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || "Location not specified",
      imagesCount: property.images?.length || 0,
      videosCount: 0,
      imageUrl: property.images && property.images.length > 0 ? property.images[0] : "/assets/property-1.jpg",
      price: typeof property.price === "string" ? property.price : `$${property.price?.toLocaleString() || "0"}`,
      title: property.title || "Property Title",
      overviewLink: `/property/${property._id}`,
      description: property.description || "No description available",
      bedrooms: property.features?.bedrooms || property.features?.beds || property.beds || 0,
      bathrooms: property.features?.bathrooms || property.features?.baths || property.baths || 0,
      squareFeet: property.features?.squareFootage || property.features?.sqft || property.sqft || 0,
      agentImage: null,
      agentName: "Property Owner",
      agentId: null,
      agentLink: "#",
      status: property.status || 'active'
    };
  };

  return (
    <section id="my-properties" className="my-properties-section">
      <div className="my-properties-header">
        <h2>My Properties</h2>
        <p>A list of properties you have purchased.</p>
      </div>
      <div className="my-properties-grid enhanced-dashboard-grid">
        {allProperties.length > 0 ? (
          allProperties.map((prop) => (
            <EnhancedPropertyCard 
              key={prop._id} 
              {...mapPropertyToEnhancedCard(prop)} 
            />
          ))
        ) : (
          <div className="dash-empty-state">
            <i className="fas fa-building"></i>
            <h3>No Properties Bought</h3>
            <p>You haven't purchased any properties yet.</p>
            <Link to="/properties?tag=sale" className="dash-cta-button">
              <i className="fas fa-search"></i> Find Properties for Sale
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyProperties;
