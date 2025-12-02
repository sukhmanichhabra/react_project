// Test agent verification API response
// Run this in the browser console on the agent verification page

async function testAgentVerificationAPI() {
  try {
    console.log("Testing agent verification API...");

    const response = await fetch("/agent/pending-verification?status=all", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // if using token auth
      },
      credentials: "include", // if using cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("API Response:", data);

    if (data.success && data.agents && data.agents.length > 0) {
      console.log(`Found ${data.agents.length} agents`);

      data.agents.forEach((agent, index) => {
        console.log(`\n--- Agent ${index + 1}: ${agent.name} ---`);
        console.log("Agent ID:", agent._id);
        console.log("Verification Status:", agent.verificationStatus);
        console.log("User Data:", agent.userId);
        console.log("User Profile Image:", agent.userId?.profileImage);

        if (agent.documents) {
          console.log("Documents Available:");
          console.log("  ID Proof:", !!agent.documents.idProof);
          console.log("  License:", !!agent.documents.license);
          console.log("  Business Proof:", !!agent.documents.businessProof);
          console.log("  Profile Photo:", !!agent.documents.profilePhoto);

          if (agent.documents.profilePhoto) {
            console.log("  Profile Photo Details:", {
              path: agent.documents.profilePhoto.path,
              originalName: agent.documents.profilePhoto.originalName,
              mimeType: agent.documents.profilePhoto.mimeType,
              uploadedAt: agent.documents.profilePhoto.uploadedAt,
            });

            // Test if the URL is accessible
            const testImg = new Image();
            testImg.onload = () => {
              console.log(
                `✅ Profile photo loads successfully: ${agent.documents.profilePhoto.path}`
              );
            };
            testImg.onerror = () => {
              console.log(
                `❌ Profile photo failed to load: ${agent.documents.profilePhoto.path}`
              );
            };
            testImg.src = agent.documents.profilePhoto.path;
          }
        } else {
          console.log("Documents: None uploaded");
        }
      });
    } else {
      console.log("No agents found or API error");
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Run the test
testAgentVerificationAPI();
