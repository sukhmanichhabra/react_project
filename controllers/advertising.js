const { PropertyModel, AdvertisingModel } = require("../models");

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

// Get advertising page (accessible to all)
exports.getAdvertisingPage = async (req, res) => {
  try {
    // If user is logged in and is a seller, fetch their properties (excluding sold ones)
    let sellerProperties = [];
    if (req.user && req.user.role === "seller") {
      // Get all seller properties
      const allProperties = await PropertyModel.getPropertiesBySeller(
        req.user._id
      );

      // Filter out sold properties and only show approved properties
      const activeProperties = allProperties.filter(
        (property) =>
          property.status !== "sold" && property.approvalStatus === "approved"
      );

      // For each property, check if it has an active advertising package
      sellerProperties = await Promise.all(
        activeProperties.map(async (property) => {
          const advertising = await AdvertisingModel.getPropertyAdvertising(
            property._id
          );
          return {
            ...property.toObject(),
            advertising: advertising || null,
          };
        })
      );
    }

    res.json({
      success: true,
      data: {
        sellerProperties,
        isAuthenticated: !!req.user,
        isSeller: req.user && req.user.role === "seller",
        packages: [
          {
            type: "basic",
            name: "Basic Package",
            price: 50,
            duration: 30,
            features: [
              "Featured listing for 30 days",
              "Standard placement",
              "Email support",
            ],
          },
          {
            type: "premium",
            name: "Premium Package",
            price: 100,
            duration: 60,
            features: [
              "Featured listing for 60 days",
              "Top placement",
              "Priority support",
              "Social media promotion",
            ],
          },
          {
            type: "pro",
            name: "Pro Package",
            price: 200,
            duration: 90,
            features: [
              "Featured listing for 90 days",
              "Premium placement",
              "24/7 support",
              "Marketing campaign",
              "Virtual tour",
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error loading advertising page:", error);
    res.status(500).json({
      success: false,
      message: "Error loading advertising page",
      error: error.message,
    });
  }
};

// Create new advertising package (seller only)
exports.createAdvertisingPackage = async (req, res) => {
  try {
    const { propertyId, packageType } = req.body;

    // Verify property belongs to seller
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property || property.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to advertise this property",
      });
    }

    // Check if property already has an active advertising package
    const existingAdvertising = await AdvertisingModel.getPropertyAdvertising(
      propertyId
    );
    if (existingAdvertising) {
      return res.status(400).json({
        success: false,
        message: "This property already has an active advertising package",
      });
    }

    // Calculate package details based on type
    let amount, durationDays;
    switch (packageType) {
      case "basic":
        amount = 50;
        durationDays = 30;
        break;
      case "premium":
        amount = 100;
        durationDays = 60;
        break;
      case "featured":
        amount = 200;
        durationDays = 90;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid package type",
        });
    }

    // Get seller user to check account balance
    const User = require("../models/user");
    const seller = await User.findById(req.user._id);

    // Check if seller has enough balance
    if (seller.accountBalance < amount) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient account balance to purchase this advertising package",
      });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Create advertising package
    const advertisingData = {
      propertyId,
      sellerId: req.user._id,
      packageType,
      endDate,
      amount,
      paymentStatus: "completed",
    };

    // Deduct amount from seller's account
    seller.accountBalance -= amount;
    await seller.save();

    // Add amount to admin account
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      admin.accountBalance = (admin.accountBalance || 0) + amount;
      await admin.save();
    }

    const newAdvertising = await AdvertisingModel.createAdvertising(
      advertisingData
    );

    res.status(201).json({
      success: true,
      message: "Advertising package created successfully",
      advertising: newAdvertising,
    });
  } catch (error) {
    console.error("Error creating advertising package:", error);
    res.status(500).json({
      success: false,
      message: "Error creating advertising package",
    });
  }
};

// Get seller's advertising packages (seller only)
exports.getMyPackages = async (req, res) => {
  try {
    const advertisingPackages = await AdvertisingModel.getSellerAdvertising(
      req.user._id
    );

    // Get property details for each package
    const packagesWithDetails = await Promise.all(
      advertisingPackages.map(async (pkg) => {
        const property = await PropertyModel.getPropertyById(pkg.propertyId);
        return {
          ...pkg.toObject(),
          property: property || { title: "Unknown Property" },
        };
      })
    );

    res.json({
      success: true,
      packages: packagesWithDetails,
    });
  } catch (error) {
    console.error("Error fetching advertising packages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching advertising packages",
    });
  }
};

// Get advertised properties for seller dashboard (seller only)
exports.getAdvertisedProperties = async (req, res) => {
  try {
    // Get all advertising packages for this seller
    const advertisingPackages = await AdvertisingModel.getSellerAdvertising(
      req.user._id
    );

    // Get property details for each package and structure with adPackage
    const advertisedProperties = await Promise.all(
      advertisingPackages.map(async (pkg) => {
        const property = await PropertyModel.getPropertyById(pkg.propertyId);
        if (!property) return null;

        return {
          ...property.toObject(),
          _id: property._id,
          adPackage: {
            _id: pkg._id,
            name:
              pkg.packageType.charAt(0).toUpperCase() +
              pkg.packageType.slice(1),
            type: pkg.packageType,
            startDate: pkg.startDate,
            endDate: pkg.endDate,
            status: pkg.status,
            amount: pkg.amount,
            paymentStatus: pkg.paymentStatus,
            priority: pkg.priority,
          },
        };
      })
    );

    // Filter out null values
    const validProperties = advertisedProperties.filter((p) => p !== null);

    res.json({
      success: true,
      data: {
        advertisedProperties: validProperties,
        count: validProperties.length,
      },
    });
  } catch (error) {
    console.error("Error fetching advertised properties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching advertised properties",
      error: error.message,
    });
  }
};

// Cancel advertising package (seller only)
exports.cancelPackage = async (req, res) => {
  try {
    const advertisingId = req.params.id;

    // Verify advertising package belongs to seller
    const advertising = await AdvertisingModel.getAdvertisingById(
      advertisingId
    );
    if (
      !advertising ||
      advertising.sellerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to cancel this advertising package",
      });
    }

    // Cancel advertising package
    const cancelledAdvertising = await AdvertisingModel.cancelAdvertising(
      advertisingId
    );

    res.json({
      success: true,
      message: "Advertising package cancelled successfully",
      advertising: cancelledAdvertising,
    });
  } catch (error) {
    console.error("Error cancelling advertising package:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling advertising package",
    });
  }
};

// Get advertisement by ID
exports.getAdvertisementById = async (req, res) => {
  try {
    const advertisementId = req.params.id;
    const advertisement = await AdvertisingModel.getAdvertisementById(
      advertisementId
    );

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
        error: "The advertisement you are looking for could not be found.",
      });
    }

    // Track advertisement view
    trackActivity(req, {
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : "Anonymous",
      userRole: req.user ? req.user.role : "anonymous",
      actionType: "advertisement_view",
      targetType: "advertisement",
      targetId: advertisementId,
      targetName: advertisement.title || "Advertisement",
    });

    // Return advertisement details
    res.json({
      success: true,
      data: {
        advertisement,
        user: req.user || null,
      },
    });
  } catch (error) {
    console.error("Error fetching advertisement details:", error);
    res.status(500).json({
      success: false,
      message: "Error loading advertisement",
      error: error.message,
    });
  }
};

// Track advertisement clicks
exports.trackAdvertisementClick = async (req, res) => {
  try {
    const advertisementId = req.params.id;

    // Track advertisement click
    let targetName = "Advertisement";
    try {
      const advertisement = await AdvertisingModel.getAdvertisementById(
        advertisementId
      );
      if (advertisement && advertisement.title) {
        targetName = advertisement.title;
      }
    } catch (err) {
      console.error(
        "Error getting advertisement details for click tracking:",
        err
      );
    }

    trackActivity(req, {
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : "Anonymous",
      userRole: req.user ? req.user.role : "anonymous",
      actionType: "advertisement_click",
      targetType: "advertisement",
      targetId: advertisementId,
      targetName: targetName,
      metadata: {
        clickDestination: req.body.destination || null,
      },
    });

    // Increment click count in the advertisement model
    await AdvertisingModel.incrementClickCount(advertisementId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking advertisement click:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track click",
    });
  }
};
