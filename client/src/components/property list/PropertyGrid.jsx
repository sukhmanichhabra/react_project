import React from "react";
import PropertyCard from "../partials/PropertyCard";
import { getPropertyImageUrl, getAgentImageUrl } from "../../utils/imageUtils";
// import EnhancedPropertyCard from "../partials/EnhancedPropertyCard";

const PropertyGrid = ({ properties = [] }) => {
  // Helper function to map database property to PropertyCard props
  const mapPropertyToCard = (property) => {
    // Validate property exists
    if (!property || !property._id) {
      console.warn("Invalid property:", property);
      return null;
    }

    // Get agent info if available
    const agent = property.agent || {};

    // Handle location - it's a string in the database, not an object
    const locationStr = property.location || property.geolocation?.address || "Location not specified";

    const mappedProperty = {
      id: property._id,
      propertyType: property.features?.type || property.type || "Apartment",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "FOR RENT" : "FOR SALE",
      location: locationStr,
      imagesCount: property.images?.length || 0,
      videosCount: 0, // Videos not stored in current schema
      imageUrl:
        property.images && property.images.length > 0
          ? getPropertyImageUrl(property.images[0])
          : "/assets/property-1.jpg",
      price:
        typeof property.price === "string"
          ? property.price
          : `$${property.price?.toLocaleString() || "0"}`,
      title: property.title || "Property Title",
      overviewLink: `/property/${property._id}`,
      description: property.description || "No description available",
      bedrooms: parseInt(property.features?.bedrooms || property.features?.beds || 0),
      bathrooms: parseInt(property.features?.bathrooms || property.features?.baths || 0),
      squareFeet: parseInt(property.features?.squareFootage || property.features?.sqft || 0),
      agentImage: getAgentImageUrl(agent.image || agent.profileImage),
      agentName: agent.fullName || agent.name || property.seller?.name || "Estate Agent",
      agentId: agent._id || null,
      agentLink: agent._id ? `/agents/${agent._id}` : "#",
      status: property.status || 'active'
    };

    console.log("Original property:", property);
    console.log("Mapped property:", mappedProperty);

    return mappedProperty;
  };

  // Filter out invalid properties
  const validProperties = properties.filter(p => p && p._id);

  if (!validProperties || validProperties.length === 0) {
    return (
      <div className="prop-list-listing" style={{ width: "100%", textAlign: "center", padding: "2rem" }}>
        <p>No properties available</p>
      </div>
    );
  }

  return (
    <div className="prop-list-listing" style={{ width: "100%" }}>
      <ul className="prop-list-property-grid enhanced-property-grid">
        {validProperties.map((property) => {
          const mappedProperty = mapPropertyToCard(property);
          return mappedProperty ? (
            <PropertyCard
              key={property._id}
              {...mappedProperty}
            />
          ) : null;
        })}
      </ul>
    </div>
  );
};

export default PropertyGrid;
