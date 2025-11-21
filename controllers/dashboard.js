const { PropertyModel, TransactionModel, MessageModel } = require("../models");
const User = require("../models/user");
const AgentModel = require("../models/agent");
const { createToken } = require("../service/auth");
const mongoose = require("mongoose");
const geocodingService = require("../service/geocoding");

// Get dashboard data based on user role
const getDashboard = async (req, res) => {
  try {
    // Get new copy of user data to ensure it's fresh
    const userId = req.user.id || req.user._id;
    let freshUserData;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      freshUserData = await User.findById(userId);

      // If user is a buyer, populate their loan requests
      if (freshUserData.role === "buyer") {
        freshUserData = await User.findById(userId).populate("loanRequests");
      }
    } else {
      freshUserData = req.user;
    }

    // Check if user exists
    if (!freshUserData) {
      return res.redirect("/auth/signin?error=Invalid+user");
    }

    // Initialize variables
    let properties = [];
    let transactions = [];
    let stats = {};
    let agentProfile = null;
    let agents = [];
    let messages = [];
    let advertisedProperties = [];

    // Fetch data based on user role
    if (freshUserData.role === "admin") {
      // Get all agents for admin with user profile images
      agents = await AgentModel.Agent.find()
        .populate("userId", "profileImage email")
        .sort({ createdAt: -1 });

      // Update agent images with user profile images if available
      agents = agents.map((agent) => {
        const agentObj = agent.toObject ? agent.toObject() : agent;
        if (agentObj.userId && agentObj.userId.profileImage) {
          agentObj.image = agentObj.userId.profileImage;
        }
        // Add email from the user model if agent doesn't have it
        if (agentObj.userId && agentObj.userId.email && !agentObj.email) {
          agentObj.email = agentObj.userId.email;
        }
        return agentObj;
      });

      // Fetch properties for admin approval with all statuses
      const pendingProperties = await PropertyModel.getPendingProperties();
      const approvedProperties = await PropertyModel.getApprovedProperties();
      const rejectedProperties = await PropertyModel.getRejectedProperties();

      // Add properties to stats with all statuses
      stats = {
        pendingPropertiesCount: pendingProperties.length,
        pendingProperties: pendingProperties,
        approvedProperties: approvedProperties,
        approvedPropertiesCount: approvedProperties.length,
        rejectedProperties: rejectedProperties,
        rejectedPropertiesCount: rejectedProperties.length,
      };

      console.log(`Dashboard - Admin - Total agents: ${agents.length}`);
      console.log(
        `Dashboard - Admin - Pending properties: ${pendingProperties.length}`
      );
      console.log(
        `Dashboard - Admin - Approved properties: ${approvedProperties.length}`
      );
      console.log(
        `Dashboard - Admin - Rejected properties: ${rejectedProperties.length}`
      );    } else if (freshUserData.role === "seller") {
      // Get only approved seller properties for "My Properties" section
      console.log("Fetching approved properties for seller ID:", userId);
      const approvedProperties = await PropertyModel.getApprovedPropertiesBySeller(userId);
      
      // Get all seller properties (including pending/rejected) for stats
      const allSellerProperties = await PropertyModel.getPropertiesBySeller(userId);

      // Set properties to approved ones for the main dashboard view
      properties = approvedProperties;

      // Get seller transactions - make sure to await the Promise
      transactions = await TransactionModel.getTransactionsBySeller(userId);

      // Get transaction statistics - make sure to await the Promise
      stats = await TransactionModel.getSellerStats(userId);

      // Add property approval stats to seller stats
      const propertyStats = {
        totalProperties: allSellerProperties.length,
        approvedProperties: allSellerProperties.filter(p => p.approvalStatus === 'approved').length,
        pendingProperties: allSellerProperties.filter(p => p.approvalStatus === 'pending').length,
        rejectedProperties: allSellerProperties.filter(p => p.approvalStatus === 'rejected').length
      };
      
      // Merge with existing transaction stats
      stats = { ...stats, ...propertyStats };

      // Get advertised properties for seller
      const { AdvertisingModel } = require("../models");
      const activeAdvertising = await AdvertisingModel.getSellerAdvertising(
        userId
      );

      // Filter for active advertisements and populate property details
      const activeAds = activeAdvertising.filter(
        (ad) => ad.status === "active"
      );
      advertisedProperties = await Promise.all(
        activeAds.map(async (ad) => {
          const property = await PropertyModel.getPropertyById(ad.propertyId);
          if (property) {
            return {
              ...property.toObject(),
              advertising: ad,
            };
          }
          return null;
        })
      );

      // Remove null entries (in case some properties were deleted)
      advertisedProperties = advertisedProperties.filter(
        (prop) => prop !== null
      );

      // Log for debugging
      console.log(`Dashboard - Seller ID: ${userId}`);
      console.log(`Dashboard - Total properties: ${properties.length}`);
      console.log(`Dashboard - Total transactions: ${transactions.length}`);
      console.log(`Dashboard - Transaction stats:`, stats);
    } else if (freshUserData.role === "buyer") {
      // Get buyer transactions - use the outer transactions variable
      console.log("Fetching transactions for buyer ID:", userId);
      transactions = await TransactionModel.getTransactionsByBuyer(userId);

      // Get properties from transactions - safely extract propertyIds
      const propertyIds = transactions
        .map((transaction) =>
          transaction.propertyId ? transaction.propertyId.toString() : null
        )
        .filter((id) => id !== null);

      // Get buyer properties directly from the database
      properties = await PropertyModel.getBuyerProperties(userId);

      // Log for debugging
      console.log(`Dashboard - Buyer ID: ${userId}`);
      console.log(`Dashboard - Total transactions: ${transactions.length}`);
      console.log(`Dashboard - Total properties: ${properties.length}`);
    } else if (freshUserData.role === "agent") {
      // Get agent profile
      agentProfile = await AgentModel.Agent.findOne({ userId: userId });

      // Get managed properties if the agent exists
      if (agentProfile) {
        // Use the correct agent model method
        properties = await AgentModel.getAgentProperties(
          agentProfile._id.toString()
        );

        // Get agent messages for the dashboard
        messages = await MessageModel.getReceivedMessages(userId);

        // Group messages by property
        const messagesByProperty = {};
        for (const message of messages) {
          if (!messagesByProperty[message.propertyId]) {
            // Find the property from properties array
            const propertyId = message.propertyId
              ? message.propertyId.toString()
              : null;
            const property = propertyId
              ? properties.find((p) => p._id.toString() === propertyId)
              : null;

            messagesByProperty[message.propertyId] = {
              propertyId: message.propertyId,
              propertyTitle:
                message.propertyTitle ||
                (property ? property.title : "Unknown Property"),
              messages: [],
            };
          }
          messagesByProperty[message.propertyId].messages.push(message);
        }

        // Convert to array for template
        const groupedMessages = Object.values(messagesByProperty);

        // Calculate unread count
        const unreadCount = messages.filter(
          (msg) => msg.status === "unread"
        ).length;

        // Add to stats
        stats = {
          ...stats,
          messageCount: messages.length,
          unreadCount: unreadCount,
          messagesByProperty: groupedMessages,
        };
      }

      // For transactions, initialize to empty array
      transactions = [];
    }

    // Sort transactions by date (newest first) - add a check to make sure it's an array
    const sortedTransactions = Array.isArray(transactions)
      ? transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];    // Get query parameters for messages
    const successMessage = req.query.success;
    const errorMessage = req.query.error;
    const section = req.query.section;

    // Debug logging for seller properties
    if (freshUserData.role === "seller") {
      console.log(`=== DASHBOARD API FOR SELLER ===`);
      console.log(`Seller ID: ${userId}`);
      console.log(`Approved Properties Count: ${properties.length}`);
      console.log(`Properties:`, properties.map(p => ({ id: p._id, title: p.title, status: p.approvalStatus })));
    }

    res.json({
      success: true,
      data: {
        properties: properties,
        transactions: sortedTransactions,
        stats: stats,
        user: freshUserData,
        agentProfile: agentProfile,
        agents: agents,
        messages: messages,
        advertisedProperties: advertisedProperties,
        successMessage,
        errorMessage,
        activeSection: section,
      },
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received:", req.body);
    const {
      name,
      phone,
      location,
      bio,
      website,
      facebook,
      twitter,
      instagram,
      linkedin,
      title,
      qualification,
      overview,
      latitude,
      longitude,
      serviceRadius,
    } = req.body;

    // Create socialLinks object from form fields
    const socialLinks = {
      facebook: facebook || "",
      twitter: twitter || "",
      instagram: instagram || "",
      linkedin: linkedin || "",
    };

    // Find the user by ID and update directly
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name || req.user.name,
          phone: phone || req.user.phone,
          location: location || req.user.location,
          bio: bio || req.user.bio,
          website: website || req.user.website,
          socialLinks: socialLinks,
          ...(req.file && {
            profileImage: req.file.path, // Cloudinary URL
          }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.error("User not found or update failed:", req.user._id);
      return res
        .status(404)
        .json({ success: false, message: "User not found or update failed" });
    }

    console.log("User updated successfully:", updatedUser);    // If the user is an agent, update the agent profile as well
    if (updatedUser.role === "agent") {
      try {
        const agentProfile = await AgentModel.Agent.findOne({
          userId: updatedUser._id,
        });

        if (agentProfile) {
          // Update agent-specific fields
          agentProfile.name = name || agentProfile.name;
          agentProfile.phone = phone || agentProfile.phone;
          agentProfile.location = location || agentProfile.location;
          agentProfile.email = updatedUser.email;

          // Update agent-specific fields if provided
          if (title) agentProfile.title = title;
          if (qualification) agentProfile.qualification = qualification;
          if (overview) agentProfile.overview = overview;

          // Update geolocation data if provided
          if (latitude && longitude) {
            agentProfile.geolocation = {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              serviceRadius: serviceRadius ? parseInt(serviceRadius) : (agentProfile.geolocation?.serviceRadius || 50)
            };
            console.log(`Updated agent geolocation: ${latitude}, ${longitude}, radius: ${agentProfile.geolocation.serviceRadius}km`);
          } else if (serviceRadius) {
            // Update only service radius if coordinates already exist
            if (agentProfile.geolocation) {
              agentProfile.geolocation.serviceRadius = parseInt(serviceRadius);
            }
          }

          // Update social links
          agentProfile.socialLinks = socialLinks;

          // Update profile image only if a new one was uploaded
          if (req.file) {
            agentProfile.image = req.file.path; // Cloudinary URL
          }

          await agentProfile.save();
          console.log("Agent profile updated successfully:", agentProfile._id);
          
          // Log geolocation update for debugging
          if (agentProfile.geolocation && agentProfile.geolocation.latitude && agentProfile.geolocation.longitude) {
            console.log(`Agent ${agentProfile.name} location updated - Lat: ${agentProfile.geolocation.latitude}, Lng: ${agentProfile.geolocation.longitude}, Radius: ${agentProfile.geolocation.serviceRadius}km`);
          }
        } else {
          console.log("Agent profile not found for user:", updatedUser._id);
        }
      } catch (agentError) {
        console.error("Error updating agent profile:", agentError);
        // Continue with user profile update even if agent update fails
      }
    }

    // Update the user in the session
    req.user = updatedUser;    // Update the token in the cookie if using token-based auth
    const token = createToken(updatedUser);
    res.cookie("token", token, { httpOnly: true });

    // Update locals.user
    res.locals.user = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    // Check if request expects JSON response (from React frontend)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // Prepare response data
      const responseData = {
        success: true,
        message: "Profile updated successfully!",
        data: {
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            bio: updatedUser.bio,
            website: updatedUser.website,
            profileImage: updatedUser.profileImage,
            socialLinks: updatedUser.socialLinks,
            role: updatedUser.role,
            accountBalance: updatedUser.accountBalance || 0,
            createdAt: updatedUser.createdAt,
          }
        }
      };

      // If user is an agent, include the updated agent profile
      if (updatedUser.role === "agent") {
        const agentProfile = await AgentModel.Agent.findOne({ userId: updatedUser._id });
        if (agentProfile) {
          responseData.data.agentProfile = agentProfile;
        }
      }

      return res.status(200).json(responseData);
    } else {
      // Redirect back to dashboard with profile section active (for traditional form submissions)
      return res.redirect("/dashboard?section=profile&updated=true#profile");
    }  } catch (error) {
    console.error("Error updating profile:", error);
    
    // Check if request expects JSON response (from React frontend)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    } else {
      // Redirect with error for traditional form submissions
      return res.redirect("/dashboard?section=profile&error=Failed+to+update+profile");
    }
  }
};

// Debug route to check user data
const debugUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        website: user.website,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        role: user.role,
        accountBalance: user.accountBalance || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: error.message,
    });
  }
};

// Delete agent (admin only)
const deleteAgent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.redirect("/dashboard?error=Unauthorized access");
    }

    const agentId = req.params.id;

    // First find the agent to get the userId
    const agent = await AgentModel.Agent.findById(agentId);

    if (!agent) {
      return res.redirect(
        "/dashboard?error=Agent not found&section=manage-agents"
      );
    }

    // Get the userId from the agent
    const userId = agent.userId;

    // Delete the agent
    const agentDeleted = await AgentModel.deleteAgent(agentId);

    if (agentDeleted) {
      // Also delete the corresponding user
      await User.findByIdAndDelete(userId);

      // Explicitly run property reassignment
      await AgentModel.initializePropertyAssignments();
      res.redirect(
        "/dashboard?success=Agent and user account deleted successfully&section=manage-agents"
      );
    } else {
      res.redirect(
        "/dashboard?error=Failed to delete agent&section=manage-agents"
      );
    }
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.redirect(
      "/dashboard?error=Failed to delete agent&section=manage-agents"
    );
  }
};

// Get agent messages
const getAgentMessages = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get the agent ID
    const agent = await AgentModel.Agent.findOne({ userId: req.user._id });
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent profile not found" });
    }

    // Get messages for the agent
    const messages = await MessageModel.getReceivedMessages(req.user._id);

    // Get the unread count
    const unreadCount = await MessageModel.getUnreadCount(req.user._id);

    // Group messages by property
    const messagesByProperty = {};
    for (const message of messages) {
      if (!messagesByProperty[message.propertyId]) {
        messagesByProperty[message.propertyId] = {
          propertyId: message.propertyId,
          propertyTitle: message.propertyTitle,
          messages: [],
        };
      }
      messagesByProperty[message.propertyId].messages.push(message);
    }

    res.json({
      success: true,
      messages: messages,
      messagesByProperty: Object.values(messagesByProperty),
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching agent messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messageId = req.params.id;
    const updatedMessage = await MessageModel.markAsRead(messageId);

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update message" });
  }
};

// Reply to message
const replyToMessage = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messageId = req.params.id;
    const { replyText } = req.body;

    if (!replyText) {
      return res
        .status(400)
        .json({ success: false, message: "Reply text is required" });
    }

    const updatedMessage = await MessageModel.markAsReplied(messageId);

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Here you would typically send the reply to the sender via email
    // This would require setting up an email service

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Error replying to message:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reply to message" });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messageId = req.params.id;
    const success = await MessageModel.deleteMessage(messageId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Message not found or already deleted",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete message" });
  }
};

// Update account balance
const updateAccountBalance = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update account balance
    user.accountBalance = (user.accountBalance || 0) + parseFloat(amount);
    await user.save();

    console.log(`Updated user ${user._id} balance to ${user.accountBalance}`);

    // Return updated user data
    res.json({
      success: true,
      message: "Account balance updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountBalance: user.accountBalance,
      },
    });
  } catch (error) {
    console.error("Error updating account balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update account balance",
      error: error.message,
    });
  }
};

// Geocode address to get coordinates
const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid address",
      });
    }

    console.log(`Geocoding request for address: ${address}`);

    // Use the geocoding service to get coordinates
    const result = await geocodingService.getCoordinatesFromAddress(address);

    console.log(`Geocoding successful: lat=${result.latitude}, lng=${result.longitude}`);

    return res.status(200).json({
      success: true,
      message: "Address geocoded successfully",
      data: {
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
      },
    });
  } catch (error) {
    console.error("Error geocoding address:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to geocode address",
    });
  }
};

// Get managed properties for agent
const getManagedProperties = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Check if user is an agent
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Only agents can access managed properties'
      });
    }

    // Get agent profile
    const agentProfile = await AgentModel.Agent.findOne({ userId: userId });

    if (!agentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    // Get all managed properties for this agent
    const managedProperties = await AgentModel.getAgentProperties(
      agentProfile._id.toString()
    );

    // Enhance properties with additional data
    const enhancedProperties = await Promise.all(
      managedProperties.map(async (property) => {
        const propertyObj = property.toObject ? property.toObject() : property;
        
        // Get messages for this property
        const messages = await MessageModel.getPropertyMessages(property._id);
        
        return {
          ...propertyObj,
          messageCount: messages.length,
          unreadMessageCount: messages.filter(m => m.status === 'unread').length
        };
      })
    );

    // Calculate statistics
    const stats = {
      totalProperties: enhancedProperties.length,
      activeProperties: enhancedProperties.filter(p => p.status === 'active').length,
      soldProperties: enhancedProperties.filter(p => p.status === 'sold').length,
      rentedProperties: enhancedProperties.filter(p => p.status === 'rented').length,
      totalMessages: enhancedProperties.reduce((sum, p) => sum + p.messageCount, 0),
      unreadMessages: enhancedProperties.reduce((sum, p) => sum + p.unreadMessageCount, 0)
    };

    // Check if request wants JSON (from React frontend)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          properties: enhancedProperties,
          stats: stats,
          agentProfile: agentProfile
        }
      });
    }

    // Otherwise render EJS view
    res.render('managed-properties', {
      title: 'Managed Properties',
      properties: enhancedProperties,
      stats: stats,
      agentProfile: agentProfile,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching managed properties:', error);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch managed properties',
        error: error.message
      });
    }

    res.status(500).render('error', {
      message: 'Failed to fetch managed properties',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  updateProfile,
  debugUser,
  deleteAgent,
  getAgentMessages,
  markMessageAsRead,
  replyToMessage,
  deleteMessage,
  updateAccountBalance,
  geocodeAddress,
  getManagedProperties,
};
