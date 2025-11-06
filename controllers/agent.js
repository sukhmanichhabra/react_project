const { AgentModel, PropertyModel } = require("../models");
const { agentDocumentUpload } = require("../config/cloudinary");

// Helper function to track activity
const trackActivity = (req, activityData) => {
  if (req.app.locals.trackActivity) {
    const Activity = require("../models/activity");
    const fullActivityData = {
      ...activityData,
      url: req.originalUrl,
      referrer: req.headers.referer || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      deviceType: req.deviceInfo ? req.deviceInfo.deviceType : "unknown",
      sessionId: req.session ? req.session.id : null,
      timestamp: new Date(),
    };

    Activity.logActivity(fullActivityData).catch((err) => {
      console.error("Error logging activity:", err);
    });
  }
};

// Use Cloudinary upload for agent documents
const upload = agentDocumentUpload;

// Search agents by name
exports.searchAgents = async (req, res) => {
  try {
    const { query } = req.query;
    const searchResults = await AgentModel.searchAgentsByName(query);

    res.json({
      agents: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error("Error searching agents:", error);
    res.status(500).json({ error: "Failed to search agents" });
  }
};

// Filter agents by verification status
exports.filterAgents = async (req, res) => {
  try {
    const { status } = req.params;
    let filteredAgents;

    if (status === "verified") {
      filteredAgents = await AgentModel.getVerifiedAgents();
    } else if (status === "unverified") {
      filteredAgents = await AgentModel.getUnverifiedAgents();
    } else {
      filteredAgents = await AgentModel.getAllAgents();
    }

    res.json({
      agents: filteredAgents,
      total: filteredAgents.length,
    });
  } catch (error) {
    console.error("Error filtering agents:", error);
    res.status(500).json({ error: "Failed to filter agents" });
  }
};

// Get all agents pending verification (admin only)
exports.getPendingVerification = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Admin access required" });
    }

    // Get status from query parameters
    const { status } = req.query;
    let filter = {};

    // Apply status filter if provided
    if (status && status !== "all") {
      filter.verificationStatus = status;
    }

    // Get all agents matching the filter
    const agents = await AgentModel.Agent.find(filter)
      .populate("userId", "name email phone location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      agents: agents,
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending verifications",
    });
  }
};

// Update agent verification status (admin only)
exports.updateVerificationStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Admin access required" });
    }

    const { status, message } = req.body;

    if (!status || !["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status provided" });
    }

    // Update agent verification status
    const agent = await AgentModel.Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    agent.verificationStatus = status;
    agent.verificationMessage =
      message ||
      (status === "verified"
        ? "Your agent account has been verified. You can now access all agent features."
        : status === "rejected"
        ? "Your verification was unsuccessful. Please review the feedback and upload new documents if needed."
        : "Your documents are being reviewed. This process typically takes 1-2 business days.");

    if (status === "verified") {
      agent.verified = true;

      // Save the agent first to update the verification status
      await agent.save();

      // Re-initialize property assignments when an agent is verified
      await AgentModel.initializePropertyAssignments();

      console.log(
        `Agent ${agent._id} verified and property assignments re-initialized`
      );
    } else if (status === "rejected") {
      agent.verified = false;
      await agent.save();
    } else {
      await agent.save();
    }

    res.json({
      success: true,
      agent: agent,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update verification status",
    });
  }
};

// Get all agents with pagination
exports.getAllAgents = async (req, res) => {
  try {
    // 1. Read all parameters from the frontend request
    const page = parseInt(req.query.page) || 1;
    const filter = req.query.filter || "all";
    const search = req.query.search || "";

    // 2. Pass ALL parameters to your model function
    const result = await AgentModel.getPaginatedAgents({
      page,
      filter,
      search,
    });

    // 3. The rest of your code for calculating counts was perfect
    const { agents, pagination } = result;
    const startCount =
      agents.length > 0
        ? (pagination.page - 1) * (pagination.limit || 9) + 1
        : 0;
    const endCount = startCount + agents.length - 1; // Corrected end count

    res.json({
      success: true,
      data: {
        agents,
        pagination,
        resultsCount: {
          start: startCount,
          end: endCount,
          total: pagination.totalAgents,
        },
      },
    });  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error: error.message,
    });
  }
};

// Get current user's agent profile
exports.getCurrentAgentProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the agent profile associated with the current user
    const agent = await AgentModel.Agent.findOne({ userId: req.user._id })
      .populate("userId", "name email phone location profileImage");

    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: "Agent profile not found",
        agentProfile: null 
      });
    }

    res.json({
      success: true,
      agentProfile: agent,
    });
  } catch (error) {
    console.error("Error fetching current agent profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent profile",
      error: error.message,
    });
  }
};
// Get agent details by ID
exports.getAgentById = async (req, res) => {
  try {
    const agentId = req.params.id;
    const agent = await AgentModel.getAgentById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
        details: "The agent you are looking for could not be found.",
      });
    }

    // Track agent view
    trackActivity(req, {
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : "Anonymous",
      userRole: req.user ? req.user.role : "anonymous",
      actionType: "agent_view",
      targetType: "agent",
      targetId: agentId,
      targetName: agent.name || "Agent",
    });

    // Get agent's properties
    const properties = await AgentModel.getAgentProperties(agent._id);

    console.log(`Found ${properties.length} properties for agent ${agent._id}`);

    // Convert properties to plain objects if they're mongoose documents
    const propertiesData = properties.map((property) =>
      property.toObject ? property.toObject() : property
    );

    // Use the user's profile image if available
    if (agent.userId && agent.userId.profileImage) {
      agent.image = agent.userId.profileImage;
    }

    res.json({
      success: true,
      data: {
        agent,
        properties: propertiesData,
        user: req.user || null,
      },
    });
  } catch (error) {
    console.error("Error fetching agent details:", error);
    res.status(500).json({
      success: false,
      message: "Error loading agent details",
      error: error.message,
    });
  }
};

// Add a new agent
exports.addAgent = async (req, res) => {
  try {
    const newAgent = await AgentModel.addAgent(req.body);
    res.status(201).json(newAgent);
  } catch (error) {
    console.error("Error adding agent:", error);
    res.status(500).json({ error: "Failed to add agent" });
  }
};

// Update an agent
exports.updateAgent = async (req, res) => {
  try {
    const updatedAgent = await AgentModel.updateAgent(req.params.id, req.body);
    if (!updatedAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Failed to update agent" });
  }
};

// Delete an agent
exports.deleteAgent = async (req, res) => {
  try {
    const success = await AgentModel.deleteAgent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ error: "Failed to delete agent" });
  }
};

// Add a review to an agent
exports.addReview = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      redirectUrl: `/auth/signin?redirect=/agent/${req.params.id}`,
    });
  }

  try {
    const success = await AgentModel.addReview(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
};

// Add a property to an agent's listings
exports.addPropertyToAgent = async (req, res) => {
  try {
    const success = await AgentModel.assignPropertyToAgent(
      req.body.propertyId,
      req.params.id
    );
    if (!success) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.status(201).json({ message: "Property added successfully" });
  } catch (error) {
    console.error("Error adding property to agent:", error);
    res.status(500).json({ error: "Failed to add property" });
  }
};

// Upload verification documents
exports.uploadDocuments = async (req, res) => {
  try {
    // Check if the user has an agent profile
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the agent profile associated with the user
    const agents = await AgentModel.Agent.find({ userId: req.user._id });

    if (!agents || agents.length === 0) {
      return res.status(404).json({ error: "Agent profile not found" });
    }

    const agent = agents[0];

    // Check if agent profile is complete
    const missingFields = [];
    if (!agent.name) missingFields.push("Name");
    if (!agent.title) missingFields.push("Professional Title");
    if (!agent.phone) missingFields.push("Phone Number");
    if (!agent.location) missingFields.push("Location");
    if (!agent.qualification) missingFields.push("Qualifications");
    if (!agent.overview || agent.overview.length < 50)
      missingFields.push("Professional Overview");

    if (missingFields.length > 0) {
      // Check if request is from API (JSON) or traditional form
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({
          error: `Please complete your profile before submitting documents. Missing: ${missingFields.join(", ")}`,
          missingFields: missingFields
        });
      } else {
        return res
          .status(400)
          .redirect(
            `/dashboard?section=verification&error=Please complete your profile before submitting documents. Missing: ${missingFields.join(
              ", "
            )}`
          );
      }
    }    // Process uploaded files
    const documents = {};
    const uploadDate = new Date();

    if (req.files.idProof && req.files.idProof[0]) {
      documents.idProof = {
        path: req.files.idProof[0].path, // Cloudinary URL
        originalName: req.files.idProof[0].originalname,
        mimeType: req.files.idProof[0].mimetype,
        uploadedAt: uploadDate,
      };
    }

    if (req.files.license && req.files.license[0]) {
      documents.license = {
        path: req.files.license[0].path, // Cloudinary URL
        originalName: req.files.license[0].originalname,
        mimeType: req.files.license[0].mimetype,
        uploadedAt: uploadDate,
      };
    }

    if (req.files.businessProof && req.files.businessProof[0]) {
      documents.businessProof = {
        path: req.files.businessProof[0].path, // Cloudinary URL
        originalName: req.files.businessProof[0].originalname,
        mimeType: req.files.businessProof[0].mimetype,
        uploadedAt: uploadDate,
      };
    }    if (req.files.profilePhoto && req.files.profilePhoto[0]) {
      documents.profilePhoto = {
        path: req.files.profilePhoto[0].path, // Cloudinary URL
        originalName: req.files.profilePhoto[0].originalname,
        mimeType: req.files.profilePhoto[0].mimetype,
        uploadedAt: uploadDate,
      };
    }

    if (
      req.files.additionalDocs &&
      Array.isArray(req.files.additionalDocs) &&
      req.files.additionalDocs.length > 0
    ) {
      documents.additionalDocs = req.files.additionalDocs.map((file) => ({
        path: file.path, // Cloudinary URL
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploadedAt: uploadDate,
      }));
    }

    // Update agent documents
    const updatedAgent = await AgentModel.updateAgentDocuments(
      agent._id,
      documents
    );

    if (!updatedAgent) {
      // Check if request is from API (JSON) or traditional form
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(500).json({
          error: "Failed to update agent documents"
        });
      } else {
        return res
          .status(500)
          .redirect(
            "/dashboard?section=verification&error=Failed to update agent documents"
          );
      }
    }    // Set verification status to pending and update submission date
    updatedAgent.verificationStatus = 'pending';
    updatedAgent.verificationMessage = 'Your documents have been submitted and are being reviewed. This process typically takes 1-2 business days.';
    updatedAgent.documentsSubmittedAt = uploadDate;
    await updatedAgent.save();

    // Check if request is from API (JSON) or traditional form
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(200).json({
        success: true,
        message: "Documents uploaded successfully!",
        agent: updatedAgent
      });
    } else {
      // Redirect back to dashboard with success message
      return res.redirect(
        "/dashboard?section=verification&success=Documents uploaded successfully!"
      );
    }
  } catch (error) {
    console.error("Error uploading agent documents:", error);
    
    // Check if request is from API (JSON) or traditional form
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        error: "Failed to upload documents. Please try again.",
        details: error.message
      });
    } else {
      res
        .status(500)
        .redirect(
          "/dashboard?section=verification&error=Failed to upload documents. Please try again."
        );
    }
  }
};

// Export multer upload middleware for use in routes
exports.upload = upload;
