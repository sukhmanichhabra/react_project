const { PropertyModel } = require("../models");
const NotificationService = require("../service/notificationService");

// Approve a property
exports.approveProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Get admin notes from request body if available
    const adminNotes = req.body.notes || "";
    // Get agent ID from request body if available
    const agentId = req.body.agentId || null;

    // Use the correct function name: approveProperty instead of updateApprovalStatus
    const property = await PropertyModel.approveProperty(
      propertyId,
      req.user._id,
      adminNotes,
      agentId
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Send notification to property owner
    try {
      await NotificationService.propertyStatusChange({
        // Use the sellerId instead of agent as the recipient
        userId: property.sellerId,
        propertyId: property._id,
        propertyTitle: property.title || "Your property",
        status: "approved",
      });
      console.log(
        `Property approval notification sent to seller ${property.sellerId}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending property approval notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Property approved successfully",
      property: property,
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve property",
    });
  }
};

// Reject a property
exports.rejectProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Get admin notes from request body
    const adminNotes = req.body.notes || "";

    // Use the correct function name: rejectProperty
    const property = await PropertyModel.rejectProperty(
      propertyId,
      req.user._id,
      adminNotes
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Send notification to property owner
    try {
      await NotificationService.propertyStatusChange({
        userId: property.sellerId,
        propertyId: property._id,
        propertyTitle: property.title || "Your property",
        status: "rejected",
        message: adminNotes || "Your property submission was rejected.",
      });
      console.log(
        `Property rejection notification sent to seller ${property.sellerId}`
      );
    } catch (notificationError) {
      console.error(
        "Error sending property rejection notification:",
        notificationError
      );
      // Continue even if notification fails
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Property rejected successfully",
      property: property,
    });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject property",
    });
  }
};
