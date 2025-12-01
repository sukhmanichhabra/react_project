/**
 * Migration script to fix agent verification status
 *
 * This script updates agents who have verificationStatus = 'pending'
 * but haven't actually submitted any documents (documentsSubmittedAt is null)
 * to have verificationStatus = 'unverified' instead.
 *
 * Run this once after deploying the fix to clean up existing data.
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/real-estate";

async function fixAgentVerificationStatus() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    const Agent = mongoose.model(
      "Agent",
      new mongoose.Schema({}, { strict: false })
    );

    // Find all agents with pending status but no submitted documents
    const agentsToFix = await Agent.find({
      verificationStatus: "pending",
      $or: [
        { documentsSubmittedAt: { $exists: false } },
        { documentsSubmittedAt: null },
        { "documents.idProof": { $exists: false } },
        { "documents.license": { $exists: false } },
      ],
    });

    console.log(
      `\nFound ${agentsToFix.length} agents with incorrect verification status`
    );

    if (agentsToFix.length === 0) {
      console.log("No agents need to be updated. Database is clean!");
      await mongoose.connection.close();
      return;
    }

    // Update each agent
    let successCount = 0;
    let failCount = 0;

    for (const agent of agentsToFix) {
      try {
        await Agent.updateOne(
          { _id: agent._id },
          {
            $set: {
              verificationStatus: "unverified",
              verificationMessage:
                "Complete your profile and submit documents for verification.",
            },
          }
        );
        console.log(
          `✅ Updated agent ${agent._id} (${
            agent.name || "Unknown"
          }) to unverified status`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update agent ${agent._id}:`, error.message);
        failCount++;
      }
    }

    console.log("\n=================================");
    console.log("Migration Complete!");
    console.log(`✅ Successfully updated: ${successCount} agents`);
    console.log(`❌ Failed to update: ${failCount} agents`);
    console.log("=================================\n");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error during migration:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
fixAgentVerificationStatus();
