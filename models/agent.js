const mongoose = require("mongoose");

// Import property model
const PropertyModel = require("./property");

// Import geocoding service
const geocodingService = require("../service/geocoding");

// Property-Agent relationship mapping (temporary until we move to a fully relational DB)
let propertyAgentMap = {};

// Agent Schema
const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Real Estate Agent",
    },
    image: {
      type: String,
      default: "/assets/agent1.png",
    },
    location: {
      type: String,
      default: "",
    },
    geolocation: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
      serviceRadius: {
        type: Number,
        default: 50, // Default service radius in kilometers
      },
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verificationMessage: {
      type: String,
      default: "Complete your profile and submit documents for verification.",
    },
    documents: {
      idProof: {
        path: String,
        originalName: String,
        mimeType: String,
        uploadedAt: Date,
      },
      license: {
        path: String,
        originalName: String,
        mimeType: String,
        uploadedAt: Date,
      },
      businessProof: {
        path: String,
        originalName: String,
        mimeType: String,
        uploadedAt: Date,
      },
      profilePhoto: {
        path: String,
        originalName: String,
        mimeType: String,
        uploadedAt: Date,
      },
      additionalDocs: [
        {
          path: String,
          originalName: String,
          mimeType: String,
          uploadedAt: Date,
        },
      ],
    },
    documentsSubmittedAt: {
      type: Date,
      default: null,
    },
    overview: {
      type: String,
      default: "",
    },
    reviews: [
      {
        name: String,
        date: String,
        rating: Number,
        text: String,
        image: String,
      },
    ],
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    listingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create Agent model
const Agent = mongoose.model("Agent", agentSchema);

// Helper function to automatically geocode agent location
async function geocodeAgentLocation(agentData) {
  try {
    if (!agentData.location || agentData.location.trim() === "") {
      console.log("No location provided for agent geocoding");
      return agentData;
    }

    console.log(`Attempting to geocode agent location: ${agentData.location}`);

    // Get coordinates from the location
    const geocodeResult = await geocodingService.getCoordinatesFromAddress(
      agentData.location
    );

    // Add geolocation data to agent
    agentData.geolocation = {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      serviceRadius: agentData.geolocation?.serviceRadius || 50, // Keep existing radius or default to 50km
    };

    console.log(
      `Agent geocoding successful: ${
        (geocodeResult.latitude, geocodeResult.longitude)
      }`
    );
    return agentData;
  } catch (geocodeError) {
    console.error("Agent geocoding failed:", geocodeError.message);
    // Continue without geocoding - agent can still be created/updated
    // Admin can add coordinates later if needed
    return agentData;
  }
}

// Initialize property assignments
async function initializePropertyAssignments() {
  // Clear existing assignments
  propertyAgentMap = {};

  try {
    // Get all properties - need to await the async function
    const allProperties = await PropertyModel.getAllProperties();

    // Get all agents sorted by verification status and creation date
    const sortedAgents = await Agent.find({})
      .sort({ verified: -1, createdAt: 1 })
      .lean();

    if (sortedAgents.length === 0) {
      console.log("No agents available for property assignment");
      return;
    }

    // Count of properties assigned to each agent
    const agentPropertyCounts = {};
    if (Array.isArray(sortedAgents)) {
      sortedAgents.forEach((agent) => {
        agentPropertyCounts[agent._id.toString()] = 0;
      });
    }

    // Only assign properties if we have agents
    if (
      Array.isArray(sortedAgents) &&
      sortedAgents.length > 0 &&
      Array.isArray(allProperties) &&
      allProperties.length > 0
    ) {
      // Assign properties to agents in a round-robin fashion
      for (const property of allProperties) {
        // Find the agent with the least number of properties
        let minPropertyCount = Infinity;
        let selectedAgentId = null;

        // First try to find a verified agent with the least properties
        for (const agent of sortedAgents) {
          const agentIdStr = agent._id.toString();
          if (
            agent.verified &&
            agentPropertyCounts[agentIdStr] < minPropertyCount
          ) {
            minPropertyCount = agentPropertyCounts[agentIdStr];
            selectedAgentId = agent._id; // Use ObjectId directly
          }
        }

        // If no verified agent is available or all have reached capacity, try unverified agents
        if (selectedAgentId === null) {
          for (const agent of sortedAgents) {
            const agentIdStr = agent._id.toString();
            if (agentPropertyCounts[agentIdStr] < minPropertyCount) {
              minPropertyCount = agentPropertyCounts[agentIdStr];
              selectedAgentId = agent._id; // Use ObjectId directly
            }
          }
        }

        // Assign property to the selected agent
        if (selectedAgentId !== null) {
          // Update in-memory map
          propertyAgentMap[property._id.toString()] =
            selectedAgentId.toString();
          agentPropertyCounts[selectedAgentId.toString()]++;

          // Update the property document in the database
          await PropertyModel.updatePropertyAgent(
            property._id,
            selectedAgentId
          );
        }
      }

      // Update listing counts in the database
      for (const agent of sortedAgents) {
        const agentIdStr = agent._id.toString();
        await Agent.findByIdAndUpdate(agent._id, {
          listingCount: agentPropertyCounts[agentIdStr] || 0,
        });
      }
    }

    console.log("Property assignments completed successfully");
  } catch (error) {
    console.error("Error initializing property assignments:", error);
  }
}

// Get properties for a specific agent
async function getAgentProperties(agentId) {
  try {
    if (!PropertyModel) {
      console.warn("Property model not set in agent.js");
      return [];
    }

    // Get properties assigned to this agent from the database
    const assignedProperties = await PropertyModel.getAgentProperties(agentId);

    console.log(
      `Agent ${agentId} has ${assignedProperties.length} properties assigned (from database)`
    );

    // If no properties found in database, fall back to in-memory map (for backward compatibility)
    if (assignedProperties.length === 0) {
      // Get all properties
      const allProperties = await PropertyModel.getAllProperties();

      // Convert agentId to string for comparison
      const agentIdStr = agentId.toString();

      // Filter properties assigned to this agent
      const mappedProperties = allProperties.filter((property) => {
        return propertyAgentMap[property._id.toString()] === agentIdStr;
      });

      console.log(
        `Agent ${agentId} has ${mappedProperties.length} properties assigned (from memory map)`
      );

      // If properties found in memory map but not in database, update the database
      if (mappedProperties.length > 0) {
        for (const property of mappedProperties) {
          await PropertyModel.updatePropertyAgent(property._id, agentId);
        }
        console.log(
          `Updated database with ${mappedProperties.length} property assignments`
        );
      }

      return mappedProperties;
    }

    return assignedProperties;
  } catch (error) {
    console.error(`Error getting properties for agent ${agentId}:`, error);
    return [];
  }
}

// Get agent for a specific property
async function getPropertyAgent(propertyId) {
  try {
    if (!PropertyModel) {
      console.warn("Property model not set in agent.js");
      return null;
    }

    // Convert propertyId to string if it's not already
    const propertyIdStr = propertyId.toString();

    // First try to get the property from database to check its agent field
    const property = await PropertyModel.getPropertyById(propertyId);

    if (property && property.agent) {
      console.log(
        `Found agent ${property.agent} for property ${propertyId} in database`
      );
      return await getAgentById(property.agent);
    }

    // If not found in database, check the in-memory map (for backward compatibility)
    const agentId = propertyAgentMap[propertyIdStr];

    if (!agentId) {
      console.log(`No agent assigned to property ${propertyId}`);
      return null;
    }

    console.log(
      `Found agent ${agentId} for property ${propertyId} in memory map`
    );

    // Update the database for future queries
    await PropertyModel.updatePropertyAgent(propertyId, agentId);

    return await getAgentById(agentId);
  } catch (error) {
    console.error(`Error getting agent for property ${propertyId}:`, error);
    return null;
  }
}

// Assign a property to an agent
async function assignPropertyToAgent(propertyId, agentId) {
  try {
    // Validate agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      console.log(`Agent with ID ${agentId} not found`);
      return false;
    }

    // Convert IDs to strings
    const propertyIdStr = propertyId.toString();
    const agentIdStr = agentId.toString();

    // Assign property to agent
    propertyAgentMap[propertyIdStr] = agentIdStr;

    // Update the agent's listing count
    const agentProperties = await getAgentProperties(agentId);
    await Agent.findByIdAndUpdate(agentId, {
      listingCount: agentProperties.length,
    });

    console.log(`Property ${propertyId} assigned to agent ${agentId}`);
    return true;
  } catch (error) {
    console.error("Error assigning property to agent:", error);
    return false;
  }
}

// Get paginated agents
// Get paginated agents
async function getPaginatedAgents({
  page = 1,
  limit = 9,
  filter = "all",
  search = "",
}) {
  try {
    // 1. Build the dynamic query object
    let query = {};

    // 2. Add filter to the query
    if (filter === "Verified") {
      query.verified = true;
    } else if (filter === "Not Verified") {
      query.verified = false;
    }
    // 'all' adds no filter, so all agents are included

    // 3. Add search to the query
    if (search) {
      // This creates a case-insensitive search for the agent's name
      query.name = new RegExp(search, "i");
    }

    // 4. Use the dynamic 'query' object to get the count
    const startIndex = (page - 1) * limit;
    const totalAgents = await Agent.countDocuments(query); // <-- CHANGED
    const totalPages = Math.ceil(totalAgents / limit);

    // 5. Use the dynamic 'query' object to find the agents
    const agents = await Agent.find(query) // <-- CHANGED
      .populate("userId", "profileImage email")
      .sort({ verified: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean(); // Map agents to include user's profile image

    const mappedAgents = agents.map((agent) => {
      if (agent.userId && agent.userId.profileImage) {
        agent.image = agent.userId.profileImage;
      }
      if (!agent.email && agent.userId && agent.userId.email) {
        agent.email = agent.userId.email;
      }
      return agent;
    });

    return {
      agents: mappedAgents,
      pagination: {
        page,
        totalPages,
        totalAgents,
        limit, // Good practice to return the limit
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error getting paginated agents:", error);
    return {
      agents: [],
      pagination: {
        page: 1,
        totalPages: 0,
        totalAgents: 0,
        limit,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

// Get all agents
async function getAllAgents() {
  try {
    const agents = await Agent.find({})
      .populate("userId", "profileImage email")
      .lean();

    // Map agents to include user's profile image
    return agents.map((agent) => {
      if (agent.userId && agent.userId.profileImage) {
        agent.image = agent.userId.profileImage;
      }
      if (!agent.email && agent.userId && agent.userId.email) {
        agent.email = agent.userId.email;
      }
      return agent;
    });
  } catch (error) {
    console.error("Error getting all agents:", error);
    return [];
  }
}

// Get agent by ID
async function getAgentById(id) {
  try {
    const agent = await Agent.findById(id)
      .populate("userId", "profileImage email")
      .lean();

    if (agent && agent.userId && agent.userId.profileImage) {
      agent.image = agent.userId.profileImage;
    }
    if (!agent.email && agent.userId && agent.userId.email) {
      agent.email = agent.userId.email;
    }

    return agent;
  } catch (error) {
    console.error(`Error getting agent by ID ${id}:`, error);
    return null;
  }
}

// Get verified agents
async function getVerifiedAgents() {
  try {
    const agents = await Agent.find({ verified: true })
      .populate("userId", "profileImage email")
      .lean();

    // Map agents to include user's profile image
    return agents.map((agent) => {
      if (agent.userId && agent.userId.profileImage) {
        agent.image = agent.userId.profileImage;
      }
      if (!agent.email && agent.userId && agent.userId.email) {
        agent.email = agent.userId.email;
      }
      return agent;
    });
  } catch (error) {
    console.error("Error getting verified agents:", error);
    return [];
  }
}

// Get unverified agents
async function getUnverifiedAgents() {
  try {
    const agents = await Agent.find({ verified: false })
      .populate("userId", "profileImage email")
      .lean();

    // Map agents to include user's profile image
    return agents.map((agent) => {
      if (agent.userId && agent.userId.profileImage) {
        agent.image = agent.userId.profileImage;
      }
      if (!agent.email && agent.userId && agent.userId.email) {
        agent.email = agent.userId.email;
      }
      return agent;
    });
  } catch (error) {
    console.error("Error getting unverified agents:", error);
    return [];
  }
}

// Search agents by name
async function searchAgentsByName(query) {
  if (!query) return [];

  try {
    const searchTerm = query.toLowerCase();
    const agents = await Agent.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { title: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .populate("userId", "profileImage email")
      .lean();

    // Map agents to include user's profile image
    return agents.map((agent) => {
      if (agent.userId && agent.userId.profileImage) {
        agent.image = agent.userId.profileImage;
      }
      if (!agent.email && agent.userId && agent.userId.email) {
        agent.email = agent.userId.email;
      }
      return agent;
    });
  } catch (error) {
    console.error("Error searching agents by name:", error);
    return [];
  }
}

// Add a new agent (called when a user signs up with agent role)
async function addAgent(userData) {
  try {
    // Check if agent already exists for this user
    const existingAgent = await Agent.findOne({ userId: userData.userId });
    if (existingAgent) {
      return existingAgent;
    }

    // Prepare agent data with automatic geocoding
    let agentData = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      location: userData.location || "",
      title: userData.title || "Real Estate Agent",
      image: userData.image || "/assets/agent1.png",
      qualification: userData.qualification || "",
      overview: userData.overview || "",
      verified: false,
      reviews: [],
    };

    // Automatically geocode the location if provided
    agentData = await geocodeAgentLocation(agentData);

    // Create a new agent with geocoded data
    const newAgent = new Agent(agentData);
    await newAgent.save();

    console.log(
      `New agent created with ID: ${
        newAgent._id
      }, Location geocoded: ${!!newAgent.geolocation?.latitude}`
    );

    // Re-initialize property assignments to include the new agent
    await initializePropertyAssignments();

    return newAgent;
  } catch (error) {
    console.error("Error adding new agent:", error);
    throw error;
  }
}

// Update agent
async function updateAgent(id, updateData) {
  try {
    // Check if location is being updated and needs geocoding
    if (updateData.location && updateData.location.trim() !== "") {
      console.log(
        `Agent ${id} location update detected, geocoding: ${updateData.location}`
      );

      // Geocode the new location
      updateData = await geocodeAgentLocation(updateData);
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (updatedAgent) {
      console.log(
        `Agent ${id} updated successfully, Location geocoded: ${!!updatedAgent
          .geolocation?.latitude}`
      );

      // If the agent's location was updated, re-initialize property assignments
      // to optimize property-agent matching based on new location
      if (updateData.geolocation) {
        console.log(
          `Re-initializing property assignments due to agent ${id} location update`
        );
        await initializePropertyAssignments();
      }
    }

    return updatedAgent;
  } catch (error) {
    console.error(`Error updating agent ${id}:`, error);
    return null;
  }
}

// Delete agent
async function deleteAgent(id) {
  try {
    const idStr = id.toString();

    // Remove agent from property assignments
    if (propertyAgentMap && typeof propertyAgentMap === "object") {
      Object.keys(propertyAgentMap).forEach((propertyId) => {
        if (propertyAgentMap[propertyId] === idStr) {
          delete propertyAgentMap[propertyId];
        }
      });
    }

    const result = await Agent.findByIdAndDelete(id);

    // Re-initialize property assignments
    await initializePropertyAssignments();

    return !!result;
  } catch (error) {
    console.error(`Error deleting agent ${id}:`, error);
    return false;
  }
}

// Add a review to an agent
async function addReview(agentId, reviewData) {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return false;
    }

    agent.reviews.push(reviewData);
    await agent.save();

    return true;
  } catch (error) {
    console.error(`Error adding review to agent ${agentId}:`, error);
    return false;
  }
}

// Create agent from user
async function createAgentFromUser(user) {
  try {
    const agent = new Agent({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      location: user.location || "",
      verified: false,
      overview: user.bio || "",
      image: user.profileImage || "/images/default-avatar.png",
    });

    await agent.save();
    console.log(`Created agent profile for user ${user._id}`);
    return agent;
  } catch (error) {
    console.error("Error creating agent from user:", error);
    throw error;
  }
}

// Update an agent's verification documents
async function updateAgentDocuments(agentId, documents) {
  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      console.error(`Agent with ID ${agentId} not found`);
      return null;
    }

    // Initialize documents object if it doesn't exist
    if (!agent.documents) {
      agent.documents = {};
    }

    // Update document fields that were provided
    if (documents.idProof) {
      agent.documents.idProof = {
        ...documents.idProof,
        uploadedAt: new Date(),
      };
    }

    if (documents.license) {
      agent.documents.license = {
        ...documents.license,
        uploadedAt: new Date(),
      };
    }

    if (documents.businessProof) {
      agent.documents.businessProof = {
        ...documents.businessProof,
        uploadedAt: new Date(),
      };
    }

    if (documents.profilePhoto) {
      agent.documents.profilePhoto = {
        ...documents.profilePhoto,
        uploadedAt: new Date(),
      };
    }

    if (
      documents.additionalDocs &&
      Array.isArray(documents.additionalDocs) &&
      documents.additionalDocs.length > 0
    ) {
      // Initialize additionalDocs array if it doesn't exist
      if (!agent.documents.additionalDocs) {
        agent.documents.additionalDocs = [];
      }

      // Add each new additional document
      documents.additionalDocs.forEach((doc) => {
        agent.documents.additionalDocs.push({
          ...doc,
          uploadedAt: new Date(),
        });
      });
    }

    // Update verification status to pending when documents are uploaded
    if (
      agent.verificationStatus === "rejected" ||
      agent.verificationStatus === "unverified"
    ) {
      agent.verificationStatus = "pending";
      agent.verificationMessage =
        "Your documents are being reviewed. This process may take 1-3 business days.";
      agent.documentsSubmittedAt = new Date();
    }

    // Save the updated agent
    await agent.save();
    return agent;
  } catch (error) {
    console.error(
      `Error updating agent documents for agent ${agentId}:`,
      error
    );
    return null;
  }
}

// Update an agent's listing count based on actual property assignments
async function updateAgentListingCount(agentId) {
  try {
    // Count how many properties this agent has assigned in the database
    if (!PropertyModel) {
      console.warn("Property model not set in agent.js");
      return false;
    }

    // Find all properties assigned to this agent
    const properties = await mongoose
      .model("Property")
      .find({ agent: agentId });
    const count = properties ? properties.length : 0;

    // Update the agent's listing count in the database
    await Agent.findByIdAndUpdate(agentId, { listingCount: count });

    console.log(`Updated agent ${agentId} listing count to ${count}`);
    return true;
  } catch (error) {
    console.error(`Error updating listing count for agent ${agentId}:`, error);
    return false;
  }
}

// Get agent by userId
async function getAgentByUserId(userId) {
  try {
    const agent = await Agent.findOne({ userId })
      .populate("userId", "profileImage email")
      .lean();

    if (!agent) {
      return null;
    }

    if (agent && agent.userId && agent.userId.profileImage) {
      agent.image = agent.userId.profileImage;
    }
    if (!agent.email && agent.userId && agent.userId.email) {
      agent.email = agent.userId.email;
    }

    return agent;
  } catch (error) {
    console.error(`Error getting agent by userId ${userId}:`, error);
    return null;
  }
}

// Calculate distance between two geographical points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Find the best agent for a property based on distance (primary) and workload (secondary)
async function findBestAgentForProperty(propertyLatitude, propertyLongitude) {
  try {
    console.log(
      `Finding best agent for property at: ${propertyLatitude}, ${propertyLongitude}`
    );

    // Get all verified agents with geolocation first
    const verifiedAgents = await Agent.find({
      verified: true,
      "geolocation.latitude": { $exists: true, $ne: null },
      "geolocation.longitude": { $exists: true, $ne: null },
    }).lean();

    // If no verified agents with geolocation, get all agents with geolocation
    let availableAgents = verifiedAgents;
    if (availableAgents.length === 0) {
      availableAgents = await Agent.find({
        "geolocation.latitude": { $exists: true, $ne: null },
        "geolocation.longitude": { $exists: true, $ne: null },
      }).lean();
    }

    // If still no agents with geolocation, fall back to any agent
    if (availableAgents.length === 0) {
      console.log(
        "No agents with geolocation found, falling back to any available agent"
      );
      availableAgents = await Agent.find({ verified: true }).lean();
      if (availableAgents.length === 0) {
        availableAgents = await Agent.find({}).lean();
      }
    }

    if (availableAgents.length === 0) {
      console.log("No agents available for assignment");
      return null;
    }

    // Calculate distance and workload for each agent
    const agentScores = [];

    for (const agent of availableAgents) {
      let distance = Infinity;
      let withinServiceRadius = false;

      // Calculate distance if both property and agent have coordinates
      if (
        propertyLatitude &&
        propertyLongitude &&
        agent.geolocation &&
        agent.geolocation.latitude &&
        agent.geolocation.longitude
      ) {
        distance = calculateDistance(
          propertyLatitude,
          propertyLongitude,
          agent.geolocation.latitude,
          agent.geolocation.longitude
        );

        // Check if property is within agent's service radius
        const serviceRadius = agent.geolocation.serviceRadius || 50;
        withinServiceRadius = distance <= serviceRadius;
      }

      // Current workload (how many properties already assigned)
      const workload = agent.listingCount || 0;

      agentScores.push({
        agent,
        distance,
        workload,
        withinServiceRadius,
        verified: !!agent.verified,
      });
    }

    // Sort using distance as primary, workload as secondary, verification as tie-breaker
    agentScores.sort((a, b) => {
      const aHasDistance = a.distance !== Infinity;
      const bHasDistance = b.distance !== Infinity;

      // Prefer agents where we know the distance
      if (aHasDistance !== bHasDistance) {
        return aHasDistance ? -1 : 1;
      }

      // Prefer agents where the property is within their service radius
      if (a.withinServiceRadius !== b.withinServiceRadius) {
        return a.withinServiceRadius ? -1 : 1;
      }

      // Primary: smaller distance first
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      // Secondary: lower workload (more equal distribution)
      if (a.workload !== b.workload) {
        return a.workload - b.workload;
      }

      // Final tie-breaker: prefer verified agents
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1;
      }

      return 0;
    });

    // Log top candidates for debugging
    console.log("Top 3 agent candidates (sorted by distance, then workload):");
    agentScores.slice(0, 3).forEach((candidate, index) => {
      const distanceLabel =
        candidate.distance === Infinity
          ? "N/A"
          : `${candidate.distance.toFixed(2)}km`;
      console.log(
        `${index + 1}. Agent: ${
          candidate.agent.name
        }, Distance: ${distanceLabel}, Workload: ${
          candidate.workload
        }, Verified: ${candidate.verified}, Within radius: ${
          candidate.withinServiceRadius
        }`
      );
    });

    return agentScores[0].agent;
  } catch (error) {
    console.error("Error finding best agent for property:", error);

    // Fallback to original round-robin-style assignment by verification then load
    const allAgents = await Agent.find({})
      .sort({ verified: -1, listingCount: 1 })
      .limit(1);
    return allAgents.length > 0 ? allAgents[0] : null;
  }
}

// Assign agent to property based on geolocation
async function assignAgentByGeolocation(
  propertyId,
  propertyLatitude,
  propertyLongitude
) {
  try {
    console.log(
      `Assigning agent for property ${propertyId} at coordinates: ${
        (propertyLatitude, propertyLongitude)
      }`
    );

    const bestAgent = await findBestAgentForProperty(
      propertyLatitude,
      propertyLongitude
    );

    if (!bestAgent) {
      console.log("No suitable agent found for property assignment");
      return null;
    }

    console.log(`Selected agent: ${bestAgent.name} (ID: ${bestAgent._id})`);

    // Update property with assigned agent
    if (PropertyModel && PropertyModel.updatePropertyAgent) {
      await PropertyModel.updatePropertyAgent(propertyId, bestAgent._id);
    }

    // Update agent's listing count
    await updateAgentListingCount(bestAgent._id);

    return bestAgent;
  } catch (error) {
    console.error("Error in geolocation-based agent assignment:", error);
    return null;
  }
}

module.exports = {
  getAllAgents,
  getAgentById,
  getVerifiedAgents,
  getUnverifiedAgents,
  searchAgentsByName,
  addAgent,
  updateAgent,
  deleteAgent,
  addReview,
  getAgentProperties,
  getPropertyAgent,
  assignPropertyToAgent,
  initializePropertyAssignments,
  getPaginatedAgents,
  createAgentFromUser,
  updateAgentDocuments,
  updateAgentListingCount,
  getAgentByUserId,
  findBestAgentForProperty,
  assignAgentByGeolocation,
  calculateDistance,
  geocodeAgentLocation,
  Agent, // Export the Mongoose model
};
