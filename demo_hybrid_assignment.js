const mongoose = require("mongoose");
const { AgentModel } = require("./models");

async function demonstrateHybridAssignment() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/final-fdfed"
    );

    console.log("=== HYBRID ASSIGNMENT DEMONSTRATION ===\n");

    // Test case 1: Property within agent service radius
    console.log("TEST 1: Property within agent service radius");
    console.log("-----------------------------------------------");

    let testAgent = await AgentModel.findBestAgentForProperty(40.7128, -74.006); // NYC coordinates

    if (testAgent) {
      console.log(`✅ Assignment successful: ${testAgent.name}`);
      console.log(`   This should be an agent within service radius of NYC`);
    } else {
      console.log("❌ No agent found");
    }

    console.log("\n");

    // Test case 2: Property outside all service radii - should get closest agent
    console.log(
      "TEST 2: Property outside all service radii (should get closest agent)"
    );
    console.log(
      "---------------------------------------------------------------------"
    );

    testAgent = await AgentModel.findBestAgentForProperty(71.0, -8.0); // Remote Arctic location

    if (testAgent) {
      console.log(`✅ Fallback assignment successful: ${testAgent.name}`);
      console.log(
        `   This should be the closest available agent (outside radius)`
      );
    } else {
      console.log("❌ No agent found");
    }

    console.log("\n");

    // Test case 3: Property with no coordinates nearby
    console.log("TEST 3: Property in a very remote location");
    console.log("------------------------------------------");

    testAgent = await AgentModel.findBestAgentForProperty(-89.0, 0.0); // Near South Pole

    if (testAgent) {
      console.log(`✅ Extreme fallback assignment: ${testAgent.name}`);
      console.log(
        `   Even very remote properties get assigned to closest agent`
      );
    } else {
      console.log("❌ No agent found");
    }

    console.log("\n=== ASSIGNMENT LOGIC SUMMARY ===");
    console.log(
      "1. 🎯 PREFERRED: Assign to agent within service radius (optimal)"
    );
    console.log(
      "2. 🔄 FALLBACK: Assign to closest agent if none within radius"
    );
    console.log(
      "3. ❌ LAST RESORT: Only leave unassigned if no agents available"
    );

    console.log("\n=== BENEFITS ===");
    console.log("✅ Properties in good coverage areas get optimal assignments");
    console.log(
      "✅ Properties in poor coverage areas still get service (closest agent)"
    );
    console.log("✅ No properties left completely without agent support");
    console.log(
      "✅ Agents can see which properties are within their ideal service area"
    );

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error in demonstration:", error);
  }
}

if (require.main === module) {
  demonstrateHybridAssignment();
}

module.exports = { demonstrateHybridAssignment };
