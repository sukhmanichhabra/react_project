const { PropertyModel, AgentModel, VisitModel } = require("../models");
const mongoose = require("mongoose");
const NotificationService = require("../service/notificationService");

// Middleware functions (moved from routes)
const requireBuyer = (req, res, next) => {
  if (!req.user || req.user.role !== "buyer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only buyers can access this page.",
    });
  }
  next();
};

const requireAgent = (req, res, next) => {
  if (!req.user || req.user.role !== "agent") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only agents can access this page.",
    });
  }
  next();
};

// Get schedule visit page for buyers
const getSchedulePage = async (req, res) => {
  try {
    // Get all approved and active properties
    const properties = await PropertyModel.getAvailableProperties();

    // Get buyer's existing visits
    const visits = await VisitModel.getVisitsByBuyer(req.user._id);

    res.json({
      success: true,
      data: {
        properties,
        visits,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching property data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load scheduling page",
      error: error.message,
    });
  }
};

// Get schedule visit page for a specific property
const getScheduleForProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Get the property details
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Get the agent for this property
    const agent = await AgentModel.getAgentById(property.agent);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not assigned to this property",
      });
    }

    // Get buyer's existing visits for this property
    const existingVisits = await VisitModel.getVisitsByProperty(propertyId);

    res.json({
      success: true,
      data: {
        property,
        agent,
        existingVisits,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching property data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load scheduling page",
      error: error.message,
    });
  }
};

// Create a new visit request
const scheduleVisit = async (req, res) => {
  try {
    const { propertyId, visitDate, timeSlot, notes } = req.body;

    // Validate required fields
    if (!propertyId || !visitDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Property, date and time are required",
      });
    }

    // Get the property details
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Get the agent for this property
    if (!property.agent) {
      return res.status(404).json({
        success: false,
        message: "No agent assigned to this property",
      });
    }

    // Create the visit
    const visitData = {
      propertyId,
      buyerId: req.user._id,
      agentId: property.agent,
      visitDate: new Date(visitDate),
      timeSlot,
      buyerNotes: notes || "",
      status: "pending",
    };

    const visit = await VisitModel.createVisit(visitData);

    // Send notification to the agent
    try {
      await NotificationService.visitStatusChange({
        userId: property.agent,
        visitId: visit._id,
        propertyTitle: property.title || "Property",
        status: "scheduled",
        visitDate: visit.visitDate,
      });
      console.log(
        `Visit scheduled notification sent to agent ${property.agent}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending visit scheduled notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // If it's an AJAX request, return JSON response
    if (req.xhr) {
      return res.json({
        success: true,
        visit,
      });
    }

    // Otherwise return JSON response for API
    res.json({
      success: true,
      data: { visit },
      message: "Visit scheduled successfully",
    });
  } catch (error) {
    console.error("Error scheduling visit:", error);

    // If it's an AJAX request, return JSON error
    if (req.xhr) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise return JSON error for API
    res.status(500).json({
      success: false,
      message: "Failed to schedule visit",
      error: error.message,
    });
  }
};

// Get all visits for the logged-in buyer
const getMyVisits = async (req, res) => {
  try {
    // Get all visits for this buyer
    const visits = await VisitModel.getVisitsByBuyer(req.user._id);

    res.json({
      success: true,
      data: {
        visits,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your visits",
      error: error.message,
    });
  }
};

// Cancel a visit (buyer)
const cancelVisit = async (req, res) => {
  try {
    const { visitId } = req.params;

    // Get the visit
    const visit = await VisitModel.getVisitById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    // Check if the visit belongs to this buyer
    if (visit.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own visits",
      });
    }

    // Check if the visit can be cancelled (not completed or cancelled)
    if (visit.status === "completed" || visit.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a visit with status: ${visit.status}`,
      });
    }

    // Update the visit
    const updateData = { status: "cancelled" };
    const updatedVisit = await VisitModel.updateVisit(visitId, updateData);

    // Get property information
    const property = await PropertyModel.getPropertyById(visit.propertyId);

    // Send notification to the agent
    try {
      await NotificationService.visitStatusChange({
        userId: visit.agentId,
        visitId: visit._id,
        propertyTitle: property ? property.title : "Property",
        status: "cancelled",
        visitDate: visit.visitDate,
      });
      console.log(
        `Visit cancellation notification sent to agent ${visit.agentId}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending visit cancellation notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // If it's an AJAX request, return JSON response
    if (req.xhr) {
      return res.json({
        success: true,
        visit: updatedVisit,
      });
    }

    // Otherwise return JSON response for API
    res.json({
      success: true,
      data: { visit: updatedVisit },
      message: "Visit cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling visit:", error);

    // If it's an AJAX request, return JSON error
    if (req.xhr) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise return JSON error for API
    res.status(500).json({
      success: false,
      message: "Failed to cancel visit",
      error: error.message,
    });
  }
};

// Get agent dashboard for visits
const getAgentDashboard = async (req, res) => {
  try {
    // Get pending visits for this agent by user ID
    const pendingVisits = await VisitModel.getPendingVisitsByAgentUserId(
      req.user._id
    );

    // Get upcoming (approved) visits for this agent
    const upcomingVisits = await VisitModel.getUpcomingVisitsByAgentUserId(
      req.user._id
    );

    // Get all visits for this agent
    const allVisits = await VisitModel.getVisitsByAgentUserId(req.user._id);

    // Get the agent profile
    const agent = await AgentModel.getAgentByUserId(req.user._id);

    res.json({
      success: true,
      data: {
        pendingVisits,
        upcomingVisits,
        allVisits,
        agent,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error fetching agent visits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent visits",
      error: error.message,
    });
  }
};

// Approve a visit request (agent)
const approveVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;

    // Get the agent's ID
    const agent = await AgentModel.getAgentByUserId(req.user._id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Get the visit
    const visit = await VisitModel.getVisitById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    // Use a more robust comparison for checking if the visit belongs to this agent
    const visitAgentId = visit.agentId
      ? visit.agentId._id
        ? visit.agentId._id.toString()
        : visit.agentId.toString()
      : null;
    const currentAgentId = agent._id.toString();

    console.log(
      `Debug - Visit Agent ID: ${visitAgentId}, Current Agent ID: ${currentAgentId}`
    );

    if (visitAgentId !== currentAgentId) {
      return res.status(403).json({
        success: false,
        message: "You can only approve visits assigned to you",
      });
    }

    // Check if the visit can be approved (only pending visits)
    if (visit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a visit with status: ${visit.status}`,
      });
    }

    // Update the visit
    const updateData = {
      status: "approved",
      agentNotes: notes || "",
    };

    const updatedVisit = await VisitModel.updateVisit(visitId, updateData);

    // Get property information
    const property = await PropertyModel.getPropertyById(visit.propertyId);

    // Send notification to the buyer
    try {
      await NotificationService.visitStatusChange({
        userId: visit.buyerId,
        visitId: visit._id,
        propertyTitle: property ? property.title : "Property",
        status: "approved",
        visitDate: visit.visitDate,
      });
      console.log(`Visit approval notification sent to buyer ${visit.buyerId}`);
    } catch (notificationError) {
      console.error(
        "Error sending visit approval notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // If it's an AJAX request, return JSON response
    if (req.xhr) {
      return res.json({
        success: true,
        visit: updatedVisit,
      });
    }

    // Otherwise return JSON response for API
    res.json({
      success: true,
      data: { visit: updatedVisit },
      message: "Visit approved successfully",
    });
  } catch (error) {
    console.error("Error approving visit:", error);

    // If it's an AJAX request, return JSON error
    if (req.xhr) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise return JSON error for API
    res.status(500).json({
      success: false,
      message: "Failed to approve visit",
      error: error.message,
    });
  }
};

// Reject a visit request (agent)
const rejectVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;

    // Get the agent's ID
    const agent = await AgentModel.getAgentByUserId(req.user._id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Get the visit
    const visit = await VisitModel.getVisitById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    // Use a more robust comparison for checking if the visit belongs to this agent
    const visitAgentId = visit.agentId
      ? visit.agentId._id
        ? visit.agentId._id.toString()
        : visit.agentId.toString()
      : null;
    const currentAgentId = agent._id.toString();

    if (visitAgentId !== currentAgentId) {
      return res.status(403).json({
        success: false,
        message: "You can only reject visits assigned to you",
      });
    }

    // Check if the visit can be rejected (only pending visits)
    if (visit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a visit with status: ${visit.status}`,
      });
    }

    // Update the visit
    const updateData = {
      status: "rejected",
      agentNotes: notes || "",
    };

    const updatedVisit = await VisitModel.updateVisit(visitId, updateData);

    // Get property information
    const property = await PropertyModel.getPropertyById(visit.propertyId);

    // Send notification to the buyer
    try {
      await NotificationService.visitStatusChange({
        userId: visit.buyerId,
        visitId: visit._id,
        propertyTitle: property ? property.title : "Property",
        status: "rejected",
        visitDate: visit.visitDate,
      });
      console.log(
        `Visit rejection notification sent to buyer ${visit.buyerId}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending visit rejection notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // If it's an AJAX request, return JSON response
    if (req.xhr) {
      return res.json({
        success: true,
        visit: updatedVisit,
      });
    }

    // Otherwise return JSON response for API
    res.json({
      success: true,
      data: { visit: updatedVisit },
      message: "Visit rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting visit:", error);

    // If it's an AJAX request, return JSON error
    if (req.xhr) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise return JSON error for API
    res.status(500).json({
      success: false,
      message: "Failed to reject visit",
      error: error.message,
    });
  }
};

// Mark a visit as completed (agent)
const completeVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { notes } = req.body;

    // Get the agent's ID
    const agent = await AgentModel.getAgentByUserId(req.user._id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Get the visit
    const visit = await VisitModel.getVisitById(visitId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    // Use a more robust comparison for checking if the visit belongs to this agent
    const visitAgentId = visit.agentId
      ? visit.agentId._id
        ? visit.agentId._id.toString()
        : visit.agentId.toString()
      : null;
    const currentAgentId = agent._id.toString();

    if (visitAgentId !== currentAgentId) {
      return res.status(403).json({
        success: false,
        message: "You can only complete visits assigned to you",
      });
    }

    // Check if the visit can be completed (only approved visits)
    if (visit.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a visit with status: ${visit.status}`,
      });
    }

    // Update the visit
    const updateData = {
      status: "completed",
      agentNotes: notes ? visit.agentNotes + "\n" + notes : visit.agentNotes,
    };

    const updatedVisit = await VisitModel.updateVisit(visitId, updateData);

    // If it's an AJAX request, return JSON response
    if (req.xhr) {
      return res.json({
        success: true,
        visit: updatedVisit,
      });
    }

    // Otherwise return JSON response for API
    res.json({
      success: true,
      data: { visit: updatedVisit },
      message: "Visit completed successfully",
    });
  } catch (error) {
    console.error("Error completing visit:", error);

    // If it's an AJAX request, return JSON error
    if (req.xhr) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // Otherwise return JSON error for API
    res.status(500).json({
      success: false,
      message: "Failed to complete visit",
      error: error.message,
    });
  }
};

// Get time slots API (used by the scheduling form)
const getTimeSlots = async (req, res) => {
  try {
    const { date, propertyId, agentId } = req.query;

    // Generate available time slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
    ];

    // If date, property, and agent ID are provided, check for existing bookings
    if (date && propertyId && agentId) {
      // Find all visits for this agent on this date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Use the already imported VisitModel's Visit model
      const { Visit } = require("../models/visit");

      // Find booked time slots for this agent on this date
      const visits = await Visit.find({
        agentId,
        visitDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "approved"] },
      });

      // Get booked time slots
      const bookedSlots = visits.map((visit) => visit.timeSlot);

      // Filter out booked slots
      const availableTimeSlots = availableSlots.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      return res.json({ timeSlots: availableTimeSlots });
    }

    // If no filtering criteria provided, return all slots
    res.json({ timeSlots: availableSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin route to manually trigger auto-completion of past visits
const processOverdueVisits = async (req, res) => {
  try {
    // Only admins and agents can trigger this
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "agent")) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only admins and agents can perform this action.",
      });
    }

    // Import the scheduler
    const VisitScheduler = require("../service/visitScheduler");

    // Run the auto-completion process
    const result = await VisitScheduler.processOverdueVisits();

    res.json(result);
  } catch (error) {
    console.error("Error processing overdue visits:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  requireBuyer,
  requireAgent,
  getSchedulePage,
  getScheduleForProperty,
  scheduleVisit,
  getMyVisits,
  cancelVisit,
  getAgentDashboard,
  approveVisit,
  rejectVisit,
  completeVisit,
  getTimeSlots,
  processOverdueVisits,
};
