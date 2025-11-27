const { RentModel, PropertyModel, AgreementModel } = require("../models");
const mongoose = require("mongoose");

// Get rent payment page - shows all properties rented by the user
exports.getRentPaymentPage = async (req, res) => {
  try {
    // Get all rented properties by this buyer
    const properties = await PropertyModel.getBuyerProperties(req.user._id);

    // Filter to only rental properties
    const rentalProperties = properties.filter(
      (property) => property.tag === "rent"
    );

    // Get rent history for each property
    const propertiesWithRentHistory = await Promise.all(
      rentalProperties.map(async (property) => {
        const rentHistory = await RentModel.getRentsByPropertyId(property._id);
        const hasPendingRent = rentHistory.some(
          (rent) => rent.status === "pending" || rent.status === "overdue"
        );

        return {
          ...property.toObject(),
          rentHistory,
          hasPendingRent,
        };
      })
    );

    // Get all rent records for this user
    const allRentRecords = await RentModel.getRentsByRenterId(req.user._id);

    // Separate into upcoming, paid, and overdue
    const upcomingRents = allRentRecords.filter(
      (rent) => rent.status === "pending"
    );
    const paidRents = allRentRecords.filter((rent) => rent.status === "paid");
    const overdueRents = allRentRecords.filter(
      (rent) => rent.status === "overdue"
    );

    res.json({
      success: true,
      data: {
        title: "Rent Payments",
        properties: propertiesWithRentHistory,
        upcomingRents,
        paidRents,
        overdueRents,
        totalPaid: paidRents.reduce((sum, rent) => sum + rent.amount, 0),
        totalDue: [...upcomingRents, ...overdueRents].reduce(
          (sum, rent) => sum + rent.amount,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching rent information:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rent information",
      error: error.message,
    });
  }
};

// Get buyer's rented properties for dashboard
exports.getBuyerRentedProperties = async (req, res) => {
  try {
    // Get all properties rented by this buyer
    const properties = await PropertyModel.getBuyerProperties(req.user._id);

    // Filter to only rented properties (status: 'rented' and tag: 'rent')
    const rentedProperties = properties.filter(
      (property) => property.tag === "rent" && property.status === "rented"
    );

    // Get rent history and agreement info for each property
    const propertiesWithRentHistory = await Promise.all(
      rentedProperties.map(async (property) => {
        const rentHistory = await RentModel.getRentsByPropertyId(property._id);
        const currentRent = rentHistory.find(
          (rent) => rent.status === "pending" || rent.status === "overdue"
        );
        const lastPaidRent = rentHistory
          .filter((rent) => rent.status === "paid")
          .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))[0];

        // Get active agreement for this rented property and buyer
        const agreement =
          await AgreementModel.getActiveAgreementForPropertyAndBuyer(
            property._id,
            req.user._id
          );

        const rentedOn =
          (agreement && agreement.startDate) ||
          (lastPaidRent && lastPaidRent.paidDate) ||
          property.createdAt;

        let leaseDuration = "12 months";
        if (agreement && agreement.startDate && agreement.endDate) {
          const start = new Date(agreement.startDate);
          const end = new Date(agreement.endDate);
          const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth()) || 1;
          leaseDuration = `${months} months`;
        }

        return {
          ...property.toObject(),
          rentHistory,
          currentRent,
          lastPaidRent,
          landlordName: property.seller?.name || "Property Owner",
          landlordEmail: property.seller?.email || "",
          rentedOn,
          leaseDuration,
          agreement: agreement
            ? {
                _id: agreement._id,
                status: agreement.status,
                startDate: agreement.startDate,
                endDate: agreement.endDate,
                monthlyRent: agreement.monthlyRent,
                lockInEndDate: agreement.lockInEndDate,
                securityDeposit: agreement.securityDeposit,
                maintenance: agreement.maintenance,
                buyerName: agreement.buyerName,
                buyerEmail: agreement.buyerEmail,
                buyerPhone: agreement.buyerPhone,
                sellerName: agreement.sellerName,
                sellerEmail: agreement.sellerEmail,
                sellerPhone: agreement.sellerPhone,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        properties: propertiesWithRentHistory,
        total: propertiesWithRentHistory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching buyer rented properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rented properties",
      error: error.message,
    });
  }
};

// Get seller's rented properties for dashboard
exports.getSellerRentedProperties = async (req, res) => {
  try {
    // Get all properties owned by this seller
    const allProperties = await PropertyModel.getPropertiesBySeller(
      req.user._id
    );

    // Filter to only properties that are rented out (status: 'rented' and tag: 'rent')
    const rentedProperties = allProperties.filter(
      (property) => property.tag === "rent" && property.status === "rented"
    );

    // Get rent and agreement information for each rented property
    const propertiesWithRentInfo = await Promise.all(
      rentedProperties.map(async (property) => {
        const rentHistory = await RentModel.getRentsByPropertyId(property._id);
        const currentRent = rentHistory.find(
          (rent) => rent.status === "pending" || rent.status === "overdue"
        );
        const totalCollected = rentHistory
          .filter((rent) => rent.status === "paid")
          .reduce((sum, rent) => sum + rent.amount, 0);

        const lastRentDate = rentHistory
          .filter((rent) => rent.status === "paid")
          .sort(
            (a, b) => new Date(b.paidDate) - new Date(a.paidDate)
          )[0]?.paidDate;

        const agreement =
          await AgreementModel.getActiveAgreementForPropertyAndBuyer(
            property._id,
            property.buyerId
          );

        return {
          ...property.toObject(),
          currentRent,
          totalCollected,
          lastRentDate,
          tenantName: property.buyer?.name || "Tenant",
          tenantEmail: property.buyer?.email || "",
          rentedSince: agreement?.startDate || property.updatedAt,
          agreement: agreement
            ? {
                _id: agreement._id,
                status: agreement.status,
                startDate: agreement.startDate,
                endDate: agreement.endDate,
                monthlyRent: agreement.monthlyRent,
                lockInEndDate: agreement.lockInEndDate,
                securityDeposit: agreement.securityDeposit,
                maintenance: agreement.maintenance,
                buyerName: agreement.buyerName,
                buyerEmail: agreement.buyerEmail,
                buyerPhone: agreement.buyerPhone,
                sellerName: agreement.sellerName,
                sellerEmail: agreement.sellerEmail,
                sellerPhone: agreement.sellerPhone,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        properties: propertiesWithRentInfo,
        total: propertiesWithRentInfo.length,
        totalRevenue: propertiesWithRentInfo.reduce(
          (sum, p) => sum + p.totalCollected,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching seller rented properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller rented properties",
      error: error.message,
    });
  }
};

// Cancel rental agreement by buyer
exports.cancelRentalAgreementByBuyer = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists and is rented by this user
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if user is the renter
    if (
      !property.buyerId ||
      property.buyerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this rental agreement",
      });
    }

    // Check if property is currently rented
    if (property.status !== "rented") {
      return res.status(400).json({
        success: false,
        message: "This property is not currently rented",
      });
    }

    // Check agreement lock-in for buyer (cannot cancel before lock-in end date)
    const activeAgreement =
      await AgreementModel.getActiveAgreementForPropertyAndBuyer(
        propertyId,
        req.user._id
      );

    if (activeAgreement) {
      const lockIn =
        activeAgreement.lockInEndDate || activeAgreement.endDate || null;
      if (lockIn && new Date() < new Date(lockIn)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot cancel this rent agreement before the end of the agreed period.",
      });
      }
    }

    // Cancel any pending rent payments
    await RentModel.updateMany(
      { propertyId, status: "pending" },
      { status: "cancelled" }
    );

    // Update property status back to active using seller's ID for authorization
    await PropertyModel.updateProperty(
      propertyId,
      {
        status: "active",
        buyerId: null,
        buyer: null,
      },
      property.sellerId
    );

    // Mark related agreements as cancelled for this buyer and property
    await AgreementModel.cancelAgreementByBuyer(propertyId, req.user._id);

    res.json({
      success: true,
      message: "Rental agreement cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling rental agreement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel rental agreement",
      error: error.message,
    });
  }
};

// Get seller's properties with rent information
exports.getSellerProperties = async (req, res) => {
  try {
    // Get all seller properties
    const properties = await PropertyModel.getPropertiesBySeller(req.user._id);

    // Get rent information for each property
    const propertiesWithRentInfo = await Promise.all(
      properties.map(async (property) => {
        // Only get rent info for rental properties that are rented
        if (property.tag === "rent" && property.status === "rented") {
          const rentHistory = await RentModel.getRentsByPropertyId(
            property._id
          );
          const hasPendingRent = rentHistory.some(
            (rent) => rent.status === "pending" || rent.status === "overdue"
          );

          return {
            ...property.toObject(),
            rentHistory,
            hasPendingRent,
          };
        }

        return property.toObject();
      })
    );

    // Get all rent records for properties owned by this seller
    const allRentRecords = await RentModel.getRentsByOwnerId(req.user._id);

    res.json({
      success: true,
      data: {
        properties: propertiesWithRentInfo,
        title: "My Properties with Rent Information",
        isMyProperties: true,
        showRentInfo: true,
        rentRecords: allRentRecords,
        activeTag: "all",
      },
    });
  } catch (error) {
    console.error("Error fetching seller properties with rent info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties with rent information",
      error: error.message,
    });
  }
};

// Generate next rent payment for a property
exports.generateRentPayment = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if user is the owner or admin
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Only seller/owner or admin can generate rent
    if (
      req.user.role !== "admin" &&
      (!property.sellerId ||
        property.sellerId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to generate rent for this property",
      });
    }

    // Generate next rent payment
    const rentRecord = await RentModel.generateNextRentPayment(propertyId);

    // Return success
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Rent payment generated successfully",
        rent: rentRecord,
      });
    }

    res.json({
      success: true,
      message: "Rent payment generated successfully",
      data: { rent: rentRecord },
    });
  } catch (error) {
    console.error("Error generating rent payment:", error);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate rent payment",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate rent payment",
      error: error.message,
    });
  }
};

// Pay a rent
exports.payRent = async (req, res) => {
  try {
    const { rentId } = req.params;
    const { paymentMethod } = req.body;

    // Pay the rent
    const paidRent = await RentModel.payRent(
      rentId,
      req.user._id,
      paymentMethod || "account"
    );

    // Return success
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Rent payment successful",
        rent: paidRent,
      });
    }

    res.json({
      success: true,
      message: "Rent payment successful",
      data: { rent: paidRent },
    });
  } catch (error) {
    console.error("Error paying rent:", error);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Failed to pay rent",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to pay rent",
      error: error.message,
    });
  }
};

// Get rent record details
exports.getRentDetails = async (req, res) => {
  try {
    const { rentId } = req.params;

    // Get rent details
    const rent = await RentModel.getRentById(rentId);
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: "Rent record not found",
      });
    }

    // Check authorization - only owner, renter or admin can view
    if (
      req.user.role !== "admin" &&
      rent.renterId.toString() !== req.user._id.toString() &&
      rent.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this rent record",
      });
    }

    // Get property details
    const property = await PropertyModel.getPropertyById(rent.propertyId);

    // Return details
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        rent,
        property: property || {},
      });
    }

    res.json({
      success: true,
      data: {
        rent,
        property: property || {},
      },
    });
  } catch (error) {
    console.error("Error fetching rent details:", error);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch rent details",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch rent details",
      error: error.message,
    });
  }
};

// Manage rent for a property
exports.getManageRentPage = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Get property details
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check authorization - only owner or admin can manage rent
    if (
      req.user.role !== "admin" &&
      (!property.sellerId ||
        property.sellerId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to manage rent for this property",
      });
    }

    // Get rent history for this property
    const rentHistory = await RentModel.getRentsByPropertyId(propertyId);

    res.json({
      success: true,
      data: {
        property,
        rentHistory,
        title: `Manage Rent - ${property.title}`,
      },
    });
  } catch (error) {
    console.error("Error displaying manage rent page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load rent management page",
      error: error.message,
    });
  }
};

// Update rent settings for a property
exports.updateRentSettings = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rentAmount, frequency, dueDay, gracePeriod, lateFee } = req.body;

    // Get property details
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check authorization - only owner can update rent settings
    if (property.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update rent settings for this property",
      });
    }

    // Update property with rent settings
    property.rentSettings = {
      amount: parseFloat(rentAmount),
      frequency: frequency || "monthly",
      dueDay: parseInt(dueDay) || 1,
      gracePeriod: parseInt(gracePeriod) || 5,
      lateFee: parseFloat(lateFee) || 0,
    };

    // Update price to match rent amount
    property.price = `$${parseFloat(rentAmount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} / month`;

    // Save the updated property
    await property.save();

    // Return success response
    res.json({
      success: true,
      message: "Rent settings updated successfully",
      data: { property },
    });
  } catch (error) {
    console.error("Error updating rent settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update rent settings",
      error: error.message,
    });
  }
};

// Cancel rental agreement by seller
exports.cancelRentalAgreement = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Get property details
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Verify seller owns the property
    if (property.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel agreements for properties you own",
      });
    }

    // Verify property is rented
    if (property.status !== "rented") {
      return res.status(400).json({
        success: false,
        message: "Property is not currently rented",
      });
    }

    // Start a shorter timeout for the transaction process
    const timeoutMs = 20000; // 20 seconds max processing time
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Perform the cancellation operation
    const cancellationPromise = (async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update property status back to active
        property.status = "active";
        property.buyerId = null;
        property.buyer = null;

        // Maintain the purchase date as cancellation reference
        const cancellationDate = new Date();
        property.cancellationDate = cancellationDate;

        await property.save({ session });

        // Mark any pending rent as cancelled
        await RentModel.updateMany(
          {
            propertyId: property._id,
            status: { $in: ["pending", "overdue"] },
          },
          {
            $set: {
              status: "cancelled",
              notes: "Cancelled due to agreement termination by owner",
            },
          },
          { session }
        );

        // Seller can cancel the agreement at any time (no lock-in restriction)
        await AgreementModel.cancelAgreementBySeller(
          property._id,
          req.user._id
        );

        // We're skipping the creation of a $0 transaction for rental cancellations
        // Comment out or remove the TransactionModel.createTransaction call for rental_cancellation

        await session.commitTransaction();
        session.endSession();

        return property;
      } catch (error) {
        // Abort transaction on error
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        throw error;
      }
    })();

    // Use Promise.race to handle potential timeout
    const result = await Promise.race([cancellationPromise, timeoutPromise]);

    // If ajax request, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Rental agreement cancelled successfully",
        property: result,
      });
    }

    // For regular form submissions, return JSON response
    return res.json({
      success: true,
      message: "Rental agreement cancelled successfully",
      data: { property: result },
    });
  } catch (error) {
    console.error("Error cancelling rental agreement by seller:", error);

    // Special handling for timeout errors
    if (error.message === "Operation timed out") {
      // For timeouts, still return success since the operation likely succeeded but just took too long
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({
          success: true,
          message:
            "Rental agreement cancellation has been initiated. Please refresh to see updates.",
        });
      }

      return res.json({
        success: true,
        message:
          "Rental agreement cancellation has been initiated. Please refresh to see updates.",
      });
    }

    // For other errors, return the actual error
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message: "Failed to cancel rental agreement",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to cancel rental agreement",
      error: error.message,
    });
  }
};
