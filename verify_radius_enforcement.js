const mongoose = require("mongoose");
const { AgentModel, PropertyModel } = require("./models");

// Quick verification script
async function verifyRadiusEnforcement() {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/final-fdfed"
    );
    console.log("Connected to MongoDB");

    console.log("=== VERIFYING STRICT RADIUS ENFORCEMENT ===\n");

    // Get all properties with assignments
    const properties = await PropertyModel.getAllProperties();
    const propertiesWithCoords = properties.filter(
      (p) => p.geolocation && p.geolocation.latitude && p.geolocation.longitude
    );

    console.log(
      `Checking ${propertiesWithCoords.length} properties with coordinates...\n`
    );

    let violations = 0;
    let withinRadius = 0;
    let unassigned = 0;

    for (const property of propertiesWithCoords) {
      const agent = await AgentModel.getPropertyAgent(property._id);

      if (!agent) {
        unassigned++;
        console.log(
          `✅ Property ${property._id}: UNASSIGNED (no agent within radius)`
        );
        continue;
      }

      if (
        !agent.geolocation ||
        !agent.geolocation.latitude ||
        !agent.geolocation.longitude
      ) {
        console.log(
          `⚠️  Property ${property._id}: Agent ${agent.name} has no coordinates`
        );
        continue;
      }

      const distance = AgentModel.calculateDistance(
        property.geolocation.latitude,
        property.geolocation.longitude,
        agent.geolocation.latitude,
        agent.geolocation.longitude
      );

      const serviceRadius = agent.geolocation.serviceRadius || 50;

      if (distance > serviceRadius) {
        violations++;
        console.log(
          `❌ VIOLATION: Property ${property._id} assigned to ${agent.name}`
        );
        console.log(
          `   Distance: ${distance.toFixed(
            2
          )}km > Service Radius: ${serviceRadius}km`
        );
        console.log(
          `   Property: ${property.geolocation.latitude}, ${property.geolocation.longitude}`
        );
        console.log(
          `   Agent: ${agent.geolocation.latitude}, ${agent.geolocation.longitude}\n`
        );
      } else {
        withinRadius++;
        console.log(
          `✅ Property ${property._id}: ${distance.toFixed(
            2
          )}km ≤ ${serviceRadius}km (${agent.name})`
        );
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Properties within radius: ${withinRadius}`);
    console.log(`Properties unassigned: ${unassigned}`);
    console.log(`Radius violations: ${violations}`);
    console.log(`Total checked: ${propertiesWithCoords.length}`);

    if (violations > 0) {
      console.log("\n🚨 RADIUS VIOLATIONS DETECTED!");
      console.log("Run the reassignment function to fix these issues:");
      console.log("await AgentModel.reassignAllPropertiesByProximity();");
    } else {
      console.log(
        "\n✅ NO RADIUS VIOLATIONS - All assignments respect service radius!"
      );
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error in radius verification:", error);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyRadiusEnforcement();
}

module.exports = { verifyRadiusEnforcement };
