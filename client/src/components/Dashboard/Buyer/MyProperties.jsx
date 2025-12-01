import React from "react";
import { Link } from "react-router-dom";
import EnhancedPropertyCard from "../../partials/EnhancedPropertyCard";
import "./MyProperties.css";
import PropertyCard from "../../partials/PropertyCard";
import {
  getPropertyImageUrl,
  getAgentImageUrl,
} from "../../../utils/imageUtils";

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
  agent: {
    _id: "mock-agent-1",
    fullName: "John Doe",
    name: "John Doe",
    image: "/assets/agent-1.jpg",
    profileImage: "/assets/agent-1.jpg",
  },
};

const MyProperties = ({ properties = [] }) => {
  // Combine mock data with API data
  const allProperties = [mockProperty, ...properties];

  // Helper function to map property data for enhanced card (same as PropertyGrid)
  const mapPropertyToEnhancedCard = (property) => {
    // Validate property exists
    if (!property || !property._id) {
      console.warn("Invalid property:", property);
      return null;
    }

    // Get agent info if available - handle both populated and unpopulated agent fields
    let agent = {};
    if (property.agent) {
      // If agent is a string (ObjectId), we need to find the agent data
      if (typeof property.agent === "string") {
        // Agent is not populated, we have only the ID
        agent = { _id: property.agent };
      } else if (typeof property.agent === "object") {
        // Agent is populated with full data
        agent = property.agent;
      }
    }

    // Debug logging for agent data
    console.log(`MyProperties: Agent data for ${property._id}:`, {
      agent: property.agent,
      agentId: agent._id,
      agentName: agent.fullName || agent.name,
      rawAgentImage: agent.image || agent.profileImage,
      processedAgentImage: getAgentImageUrl(agent.image || agent.profileImage),
    });

    // Handle location - it's a string in the database, not an object
    const locationStr =
      property.location ||
      property.geolocation?.address ||
      "Location not specified";

    return {
      id: property._id,
      propertyType: property.features?.type || property.type || "Apartment",
      amenities: property.amenities || [],
      badge: property.tag === "rent" ? "green" : "orange",
      badgeText: property.tag === "rent" ? "RENTED" : "PURCHASED",
      location: locationStr,
      imagesCount: property.images?.length || 0,
      videosCount: 0,
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
      bedrooms: parseInt(
        property.features?.bedrooms ||
          property.features?.beds ||
          property.beds ||
          0
      ),
      bathrooms: parseInt(
        property.features?.bathrooms ||
          property.features?.baths ||
          property.baths ||
          0
      ),
      squareFeet: parseInt(
        property.features?.squareFootage ||
          property.features?.sqft ||
          property.sqft ||
          0
      ),
      agentImage: getAgentImageUrl(agent.image || agent.profileImage),
      agentName:
        agent.fullName || agent.name || property.seller?.name || "Estate Agent",
      agentId: agent._id || null,
      agentLink: agent._id ? `/agents/${agent._id}` : "#",
      status: property.status || "active",
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
          allProperties.map((prop) => {
            const mappedProperty = mapPropertyToEnhancedCard(prop);
            return mappedProperty ? (
              <PropertyCard
                key={prop._id}
                propertyId={prop._id}
                {...mappedProperty}
              />
            ) : null;
          })
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
