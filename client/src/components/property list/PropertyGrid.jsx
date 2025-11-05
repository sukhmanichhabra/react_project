import React from "react";
import PropertyCard from "../partials/PropertyCard";
import EnhancedPropertyCard from "../partials/EnhancedPropertyCard";

const PropertyGrid = ({ properties }) => {  // Helper function to map database property to PropertyCard props
  const mapPropertyToCard = (property) => {
    // Get agent info if available
    const agent = property.agent || {};

    const mappedProperty = {
      id: property._id,
      propertyType: property.features?.type || "Apartment",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "FOR RENT" : "FOR SALE",
      location: `${property.location?.address || ''}, ${property.location?.city || ''}, ${property.location?.state || ''}`.replace(/^,\s*|,\s*$/g, '') || "Location not specified",
      imagesCount: property.images?.length || 0,
      videosCount: 0, // Videos not stored in current schema
      imageUrl:
        property.images && property.images.length > 0
          ? property.images[0]
          : "/assets/property-1.jpg",
      price:
        typeof property.price === "string"
          ? property.price
          : `$${property.price?.toLocaleString() || "0"}`,
      title: property.title || "Property Title",
      overviewLink: `/property/${property._id}`,
      description: property.description || "No description available",
      bedrooms: property.features?.bedrooms || property.features?.beds || 0,
      bathrooms: property.features?.bathrooms || property.features?.baths || 0,
      squareFeet: property.features?.squareFootage || property.features?.sqft || 0,
      agentImage: agent.image || agent.profileImage || null,
      agentName: agent.fullName || agent.name || property.seller?.name || "Estate Agent",
      agentId: agent._id || null,
      agentLink: agent._id ? `/agents/${agent._id}` : "#",
      status: property.status || 'active'
    };

    console.log("Original property:", property);
    console.log("Mapped property:", mappedProperty);

    return mappedProperty;
  };return (
      <div className="prop-list-listing" style={{ width: "100%" }}>
        <ul className="prop-list-property-grid enhanced-property-grid">
          {properties.map((property) => (
            <EnhancedPropertyCard
              key={property._id || property.id}
              {...mapPropertyToCard(property)}
            />
          ))}
        </ul>
      </div>
    );
};

export default PropertyGrid;
