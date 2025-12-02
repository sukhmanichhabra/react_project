const { AgentModel } = require("./models");

async function testAgentVerificationData() {
  try {
    console.log("Testing agent verification data...");

    // Get all agents with documents
    const agents = await AgentModel.Agent.find({})
      .populate("userId", "name email phone location profileImage")
      .lean();

    console.log(`Found ${agents.length} agents`);

    agents.forEach((agent, index) => {
      console.log(`\n--- Agent ${index + 1}: ${agent.name} ---`);
      console.log("User ID:", agent.userId?._id);
      console.log("User Profile Image:", agent.userId?.profileImage);
      console.log("Verification Status:", agent.verificationStatus);

      if (agent.documents) {
        console.log("Documents:");

        if (agent.documents.profilePhoto) {
          console.log("  Profile Photo:", {
            path: agent.documents.profilePhoto.path,
            originalName: agent.documents.profilePhoto.originalName,
            mimeType: agent.documents.profilePhoto.mimeType,
            uploadedAt: agent.documents.profilePhoto.uploadedAt,
          });
        } else {
          console.log("  Profile Photo: Not provided");
        }

        if (agent.documents.idProof) {
          console.log("  ID Proof:", {
            path: agent.documents.idProof.path,
            originalName: agent.documents.idProof.originalName,
          });
        } else {
          console.log("  ID Proof: Not provided");
        }

        if (agent.documents.license) {
          console.log("  License:", {
            path: agent.documents.license.path,
            originalName: agent.documents.license.originalName,
          });
        } else {
          console.log("  License: Not provided");
        }

        if (agent.documents.businessProof) {
          console.log("  Business Proof:", {
            path: agent.documents.businessProof.path,
            originalName: agent.documents.businessProof.originalName,
          });
        } else {
          console.log("  Business Proof: Not provided");
        }
      } else {
        console.log("Documents: None uploaded");
      }
    });
  } catch (error) {
    console.error("Error testing agent verification data:", error);
  }

  process.exit(0);
}

// Run the test
testAgentVerificationData();
