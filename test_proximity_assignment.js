const mongoose = require("mongoose");
const { AgentModel, PropertyModel } = require("./models");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/final-fdfed",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test proximity-based assignment
async function testProximityAssignment() {
  try {
    console.log("=== TESTING PROXIMITY-BASED ASSIGNMENT ===\n");

    // Get sample properties with coordinates
    const properties = await PropertyModel.getAllProperties();
    const propertiesWithCoords = properties.filter(
      (p) => p.geolocation && p.geolocation.latitude && p.geolocation.longitude
    );

    console.log(
      `Found ${propertiesWithCoords.length} properties with coordinates`
    );

    if (propertiesWithCoords.length === 0) {
      console.log(
        "No properties with coordinates found. Adding sample test data..."
      );
      // You might want to add some test properties here if needed
      return;
    }

    // Get all agents with coordinates
    const agents = await AgentModel.getAllAgents();
    const agentsWithCoords = agents.filter(
      (a) => a.geolocation && a.geolocation.latitude && a.geolocation.longitude
    );

    console.log(`Found ${agentsWithCoords.length} agents with coordinates\n`);

    if (agentsWithCoords.length === 0) {
      console.log(
        "No agents with coordinates found. Cannot test proximity assignment."
      );
      return;
    }

    // Test assignment for first few properties
    const testProperties = propertiesWithCoords.slice(
      0,
      Math.min(5, propertiesWithCoords.length)
    );

    console.log("Testing assignment for sample properties:\n");

    for (const property of testProperties) {
      console.log(`\nProperty ID: ${property._id}`);
      console.log(
        `Property Location: ${property.geolocation.latitude}, ${property.geolocation.longitude}`
      );

      // Find best agent using proximity
      const bestAgent = await AgentModel.findBestAgentForProperty(
        property.geolocation.latitude,
        property.geolocation.longitude
      );

      if (bestAgent) {
        console.log(`Best Agent: ${bestAgent.name}`);
        console.log(
          `Agent Location: ${bestAgent.geolocation.latitude}, ${bestAgent.geolocation.longitude}`
        );

        // Calculate distance
        const distance = AgentModel.calculateDistance(
          property.geolocation.latitude,
          property.geolocation.longitude,
          bestAgent.geolocation.latitude,
          bestAgent.geolocation.longitude
        );

        console.log(`Distance: ${distance.toFixed(2)} km`);
        console.log(
          `Service Radius: ${bestAgent.geolocation.serviceRadius || 50} km`
        );
        console.log(
          `Within Service Area: ${
            distance <= (bestAgent.geolocation.serviceRadius || 50)
              ? "Yes"
              : "No"
          }`
        );
        console.log(`Agent Verified: ${bestAgent.verified ? "Yes" : "No"}`);
        console.log(`Current Listings: ${bestAgent.listingCount || 0}`);

        // Check current assignment
        const currentAgent = await AgentModel.getPropertyAgent(property._id);
        if (currentAgent) {
          console.log(`Currently Assigned To: ${currentAgent.name}`);
          console.log(
            `Assignment Optimal: ${
              currentAgent._id.toString() === bestAgent._id.toString()
                ? "Yes"
                : "No"
            }`
          );
        } else {
          console.log(`Currently Assigned To: None`);
        }
      } else {
        console.log("No suitable agent found");
      }

      console.log("-".repeat(60));
    }

    console.log("\n=== TESTING BULK REASSIGNMENT ===\n");

    // Test the bulk reassignment function
    const reassignmentResult =
      await AgentModel.reassignAllPropertiesByProximity();

    console.log("Reassignment Results:");
    console.log(`- Total Properties: ${reassignmentResult.total || "N/A"}`);
    console.log(
      `- Successfully Reassigned: ${reassignmentResult.reassigned || 0}`
    );
    console.log(
      `- Left Unassigned (No Agent in Radius): ${
        reassignmentResult.unassigned || 0
      }`
    );
    console.log(
      `- Skipped (No Coordinates): ${reassignmentResult.skippedNoCoords || 0}`
    );
    console.log(`- Failed Assignments: ${reassignmentResult.failed || 0}`);
    console.log(`- Success: ${reassignmentResult.success ? "Yes" : "No"}`);

    if (reassignmentResult.error) {
      console.log(`- Error: ${reassignmentResult.error}`);
    }

    // Show unassigned properties
    console.log("\\n=== ASSIGNMENT ANALYSIS ===\\n");

    const unassignedProperties = await AgentModel.getUnassignedProperties();

    if (unassignedProperties.length > 0) {
      console.log(
        `Found ${unassignedProperties.length} properties that couldn't be assigned within service radius:`
      );

      unassignedProperties.slice(0, 10).forEach((property, index) => {
        console.log(`\\n${index + 1}. Property ID: ${property._id}`);
        if (property.title) console.log(`   Title: ${property.title}`);
        if (property.geolocation) {
          console.log(
            `   Location: ${property.geolocation.latitude}, ${property.geolocation.longitude}`
          );
        }
        console.log(`   Reason: ${property.reason}`);
        if (property.assignedAgent) {
          console.log(
            `   Currently Assigned To: ${property.assignedAgent} (${property.distance}km away, radius: ${property.serviceRadius}km)`
          );
        }
      });

      if (unassignedProperties.length > 10) {
        console.log(
          `\\n... and ${unassignedProperties.length - 10} more properties`
        );
      }

      console.log(
        "\\n� RECOMMENDATION: Consider expanding agent service radius or adding more agents in these areas"
      );
    } else {
      console.log(
        "✅ All properties with coordinates are assigned to agents within service radius!"
      );
    }

    console.log("\n=== AGENT DISTRIBUTION AFTER REASSIGNMENT ===\n");

    // Show agent distribution
    const updatedAgents = await AgentModel.getAllAgents();
    const agentDistribution = updatedAgents.map((agent) => ({
      name: agent.name,
      verified: agent.verified,
      listingCount: agent.listingCount || 0,
      hasCoordinates: !!(agent.geolocation && agent.geolocation.latitude),
      serviceRadius: agent.geolocation?.serviceRadius || 50,
    }));

    // Sort by listing count
    agentDistribution.sort((a, b) => b.listingCount - a.listingCount);

    console.log("Agent Listing Distribution:");
    agentDistribution.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   - Properties: ${agent.listingCount}`);
      console.log(`   - Verified: ${agent.verified ? "Yes" : "No"}`);
      console.log(
        `   - Has Coordinates: ${agent.hasCoordinates ? "Yes" : "No"}`
      );
      console.log(`   - Service Radius: ${agent.serviceRadius} km`);
      console.log("");
    });

    console.log("=== TEST COMPLETED ===");
  } catch (error) {
    console.error("Error in proximity assignment test:", error);
  }
}

// Run the test
const runTest = async () => {
  await connectDB();
  await testProximityAssignment();

  console.log("\nClosing database connection...");
  await mongoose.connection.close();
  console.log("Test completed successfully!");
  process.exit(0);
};

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = { testProximityAssignment };
