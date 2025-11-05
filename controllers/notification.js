const NotificationModel = require("../models/notification");
const NotificationService = require("../service/notificationService");
const mongoose = require("mongoose");

// Test route to create sample notifications of all types
const createTestAll = async (req, res) => {
  try {
    // Create test notifications of all types
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5); // 5 days from now

    // EMI due notification
    const emiNotification = await NotificationService.emiDue({
      userId: req.user._id,
      emiId: new mongoose.Types.ObjectId(),
      loanId: new mongoose.Types.ObjectId(),
      propertyTitle: "Test Property EMI",
      dueDate: testDate,
      amount: 25000,
    });

    // Rent due notification
    const rentNotification = await NotificationService.rentDue({
      userId: req.user._id,
      rentId: new mongoose.Types.ObjectId(),
      propertyTitle: "Test Rental Property",
      dueDate: testDate,
      amount: 15000,
    });

    // Property approved notification
    const propertyApprovedNotification =
      await NotificationService.propertyStatusChange({
        userId: req.user._id,
        propertyId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property For Sale",
        status: "approved",
      });

    // Property rejected notification
    const propertyRejectedNotification =
      await NotificationService.propertyStatusChange({
        userId: req.user._id,
        propertyId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property With Issues",
        status: "rejected",
      });

    // Property sold notification
    const propertySoldNotification =
      await NotificationService.propertyStatusChange({
        userId: req.user._id,
        propertyId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Just Sold",
        status: "sold",
      });

    // Property rented notification
    const propertyRentedNotification =
      await NotificationService.propertyStatusChange({
        userId: req.user._id,
        propertyId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Just Rented",
        status: "rented",
      });

    // Loan approved notification
    const loanApprovedNotification = await NotificationService.loanStatusChange(
      {
        userId: req.user._id,
        loanId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Loan",
        status: "approved",
        amount: 2000000,
      }
    );

    // Loan rejected notification
    const loanRejectedNotification = await NotificationService.loanStatusChange(
      {
        userId: req.user._id,
        loanId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Loan Application",
        status: "rejected",
        amount: 3000000,
      }
    );

    // Visit scheduled notification
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + 2); // 2 days from now

    const visitScheduledNotification =
      await NotificationService.visitStatusChange({
        userId: req.user._id,
        visitId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Visit",
        status: "scheduled",
        visitDate: visitDate,
      });

    // Visit approved notification
    const visitApprovedNotification =
      await NotificationService.visitStatusChange({
        userId: req.user._id,
        visitId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Visit",
        status: "approved",
        visitDate: visitDate,
      });

    // Visit rejected notification
    const visitRejectedNotification =
      await NotificationService.visitStatusChange({
        userId: req.user._id,
        visitId: new mongoose.Types.ObjectId(),
        propertyTitle: "Test Property Visit",
        status: "rejected",
        visitDate: visitDate,
      });

    // Message received notification
    const messageNotification = await NotificationService.newMessage({
      userId: req.user._id,
      messageId: new mongoose.Types.ObjectId(),
      senderName: "Test Sender",
      messagePreview:
        "This is a test message to verify the notification system works correctly.",
    });

    // System notification
    const systemNotification = await NotificationService.systemNotification({
      userId: req.user._id,
      title: "Welcome to Notifications",
      message:
        "Your notification system is now active. You will receive alerts for important updates.",
      link: "/notifications",
      priority: "medium",
    });

    const count = 13; // Total number of notifications created

    res.redirect("/notifications?success=true&count=" + count);
  } catch (error) {
    console.error("Error creating test notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notifications",
      error: error.message,
    });
  }
};

// Get all notifications for the logged-in user
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === "true";

    // Get notifications for the user
    const notifications = await NotificationModel.getUserNotifications(
      req.user._id,
      {
        limit,
        skip,
        unreadOnly,
      }
    );

    // Get total unread count
    const unreadCount = await NotificationModel.getUnreadCount(req.user._id);

    // Get total count for pagination
    const totalCount = await NotificationModel.Notification.countDocuments({
      userId: req.user._id,
      ...(unreadOnly ? { isRead: false } : {}),
    });

    const totalPages = Math.ceil(totalCount / limit);

    // If it's an API request, return JSON
    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.json({
        notifications,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          unreadCount,
        },
      });
    }

    // Otherwise return notifications data as JSON
    res.json({
      success: true,
      data: {
        title: "Notifications",
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
        },
        unreadOnly,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
      error: error.message,
    });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Get notification to check ownership
    const notification = await NotificationModel.Notification.findById(
      notificationId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Mark as read
    const updated = await NotificationModel.markAsRead(notificationId);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.json({
        success: true,
        notification: updated,
      });
    }

    // Redirect back to notifications page
    res.redirect("/notifications");
  } catch (error) {
    console.error("Error marking notification as read:", error);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const count = await NotificationModel.markAllAsRead(req.user._id);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.json({
        success: true,
        count,
      });
    }

    // Redirect back to notifications page
    res.redirect("/notifications");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Get notification to check ownership
    const notification = await NotificationModel.Notification.findById(
      notificationId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Delete the notification
    await NotificationModel.deleteNotification(notificationId);

    return res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Test route to create a notification
const createTest = async (req, res) => {
  try {
    // Create a test notification
    const testNotification = {
      userId: req.user._id,
      type: "system",
      title: "Test Notification",
      message: "This is a test notification to verify the notification system.",
      priority: "medium",
      isRead: false,
      createdAt: new Date(),
    };

    await NotificationModel.createNotification(testNotification);

    res.redirect("/notifications");
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test notification",
      error: error.message,
    });
  }
};

module.exports = {
  createTestAll,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createTest,
};
