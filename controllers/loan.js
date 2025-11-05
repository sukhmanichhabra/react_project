const { LoanApplication } = require("../models/loanApplication");
const User = require("../models/user");
const EMI = require("../models/emi");
const NotificationService = require("../service/notificationService");
const PropertyModel = require("../models/property");

// Get loan EMI calculator page data
const getEmiCalculator = (req, res) => {
  res.json({
    success: true,
    data: {
      title: "EMI Calculator",
      user: req.user || null,
      defaultValues: {
        loanAmount: 1000000,
        interestRate: 8.5,
        loanTenure: 20,
      },
    },
  });
};

// Submit loan application form
const submitLoanApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dob,
      maritalStatus,
      employmentType,
      monthlyIncome,
      workExperience,
      employerName,
      designation,
      loanAmount,
      loanTenure,
      interestRate,
      propertyType,
      loanType,
      propertyValue,
      propertyAddress,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !dob ||
      !maritalStatus ||
      !employmentType ||
      !monthlyIncome ||
      !workExperience ||
      !loanAmount ||
      !loanTenure ||
      !propertyType ||
      !loanType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    // Create document objects
    const documents = {};

    if (req.files) {
      if (req.files.identityProof && req.files.identityProof[0]) {
        documents.identityProof = {
          path: "/uploads/loans/" + req.files.identityProof[0].filename,
          originalName: req.files.identityProof[0].originalname,
          mimeType: req.files.identityProof[0].mimetype,
          uploadedAt: new Date(),
        };
      }

      if (req.files.addressProof && req.files.addressProof[0]) {
        documents.addressProof = {
          path: "/uploads/loans/" + req.files.addressProof[0].filename,
          originalName: req.files.addressProof[0].originalname,
          mimeType: req.files.addressProof[0].mimetype,
          uploadedAt: new Date(),
        };
      }

      if (req.files.incomeProof && req.files.incomeProof[0]) {
        documents.incomeProof = {
          path: "/uploads/loans/" + req.files.incomeProof[0].filename,
          originalName: req.files.incomeProof[0].originalname,
          mimeType: req.files.incomeProof[0].mimetype,
          uploadedAt: new Date(),
        };
      }

      if (req.files.propertyDocuments && req.files.propertyDocuments[0]) {
        documents.propertyDocuments = {
          path: "/uploads/loans/" + req.files.propertyDocuments[0].filename,
          originalName: req.files.propertyDocuments[0].originalname,
          mimeType: req.files.propertyDocuments[0].mimetype,
          uploadedAt: new Date(),
        };
      }

      if (req.files.bankStatements && req.files.bankStatements[0]) {
        documents.bankStatements = {
          path: "/uploads/loans/" + req.files.bankStatements[0].filename,
          originalName: req.files.bankStatements[0].originalname,
          mimeType: req.files.bankStatements[0].mimetype,
          uploadedAt: new Date(),
        };
      }

      if (
        req.files.additionalDocs &&
        Array.isArray(req.files.additionalDocs) &&
        req.files.additionalDocs.length > 0
      ) {
        documents.additionalDocs = req.files.additionalDocs.map((file) => ({
          path: "/uploads/loans/" + file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
        }));
      }
    }

    // Create loan application
    const loanApplication = new LoanApplication({
      userId: req.user._id,
      applicantName: fullName,
      email,
      phone,
      dateOfBirth: new Date(dob),
      maritalStatus,
      employmentDetails: {
        employmentType,
        monthlyIncome,
        workExperience,
        employerName,
        designation,
      },
      loanDetails: {
        loanAmount,
        loanTenure,
        interestRate: interestRate || 8.5,
        propertyType,
        loanType,
        propertyValue,
        propertyAddress,
      },
      documents,
      applicationStatus: "pending",
    });

    // Save loan application
    await loanApplication.save();

    // Update user model to reference this loan application
    await User.findByIdAndUpdate(req.user._id, {
      $push: { loanRequests: loanApplication._id },
    });

    res.status(201).json({
      success: true,
      message: "Loan application submitted successfully",
      loanApplication: {
        id: loanApplication._id,
        status: loanApplication.applicationStatus,
        amount: loanApplication.loanDetails.loanAmount,
        tenure: loanApplication.loanDetails.loanTenure,
        emi: loanApplication.loanDetails.emi,
      },
    });
  } catch (error) {
    console.error("Error submitting loan application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit loan application",
      error: error.message,
    });
  }
};

// Get loan applications for logged in user
const getMyApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.getApplicationsByUser(
      req.user._id
    );

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan applications",
      error: error.message,
    });
  }
};

// Get all loan applications (admin only)
const getAdminApplications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get query parameters
    const { status, type, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.applicationStatus = status;
    }

    // Filter by loan type
    if (type && type !== "all") {
      query["loanDetails.loanType"] = type;
    }

    // Search by name or application ID
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { applicantName: searchRegex },
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
        { email: searchRegex },
        { phone: searchRegex },
      ].filter((condition) => condition._id !== null); // Remove null ID condition
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (req.query.sort === "amount_high") {
      sortOption = { "loanDetails.loanAmount": -1 };
    } else if (req.query.sort === "amount_low") {
      sortOption = { "loanDetails.loanAmount": 1 };
    }

    // Get total count
    const totalCount = await LoanApplication.countDocuments(query);

    // Get applications
    const applications = await LoanApplication.find(query)
      .populate("userId", "name email phone")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Get application stats
    const stats = await LoanApplication.getApplicationStats();

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan applications",
      error: error.message,
    });
  }
};

// Update loan application status
const updateApplicationStatus = async (req, res) => {
  try {
    // Only admin can update loan status
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { status, remarks } = req.body;

    if (
      !status ||
      ![
        "pending",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
        "info_requested",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
      });
    }

    const application = await LoanApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found",
      });
    }

    // Update application status
    application.applicationStatus = status;

    // Update remarks if provided
    if (remarks) {
      application.adminRemarks = remarks;
    }

    if (status === "approved") {
      application.approvedBy = req.user._id;
      application.approvalDate = new Date();

      // When the loan is approved, update the user's account balance
      const user = await User.findById(application.userId);
      if (user) {
        // Add the loan amount to the user's account balance
        const loanAmount = application.loanDetails.loanAmount;
        user.accountBalance = (user.accountBalance || 0) + loanAmount;
        await user.save();
        console.log(
          `Updated user ${user._id} balance to ${user.accountBalance} after loan approval`
        );

        // Get property information if available
        let propertyTitle = "your property";
        if (application.loanDetails.propertyAddress) {
          propertyTitle =
            application.loanDetails.propertyAddress.substring(0, 30) + "...";
        }

        // Create notification for loan approval
        await NotificationService.loanStatusChange({
          userId: user._id,
          loanId: application._id,
          propertyTitle: propertyTitle,
          status: "approved",
          amount: loanAmount,
        });

        console.log("Loan approval notification created for user", user._id);
      }
    } else if (status === "rejected") {
      const user = await User.findById(application.userId);
      if (user) {
        // Get property information if available
        let propertyTitle = "your property";
        if (application.loanDetails.propertyAddress) {
          propertyTitle =
            application.loanDetails.propertyAddress.substring(0, 30) + "...";
        }

        // Create notification for loan rejection
        await NotificationService.loanStatusChange({
          userId: user._id,
          loanId: application._id,
          propertyTitle: propertyTitle,
          status: "rejected",
          amount: application.loanDetails.loanAmount,
        });

        console.log("Loan rejection notification created for user", user._id);
      }
    }

    await application.save();

    res.json({
      success: true,
      message: `Loan application ${status.replace("_", " ")} successfully`,
      application,
    });
  } catch (error) {
    console.error("Error updating loan application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update loan application status",
      error: error.message,
    });
  }
};

// Get loan application details
const getApplicationDetails = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("approvedBy", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found",
      });
    }

    // Check if user is allowed to view this application
    if (
      req.user.role !== "admin" &&
      application.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching loan application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan application",
      error: error.message,
    });
  }
};

// View all EMI payments for a user
const getMyEmis = async (req, res) => {
  try {
    // First check if user has any approved loans
    const approvedLoans = await LoanApplication.find({
      userId: req.user._id,
      applicationStatus: "approved",
    }).populate("userId", "name email phone");

    if (approvedLoans.length === 0) {
      return res.json({
        success: true,
        data: {
          title: "EMI Payments",
          loans: [],
          message: "No approved loans found. Please apply for a loan first.",
          user: req.user,
        },
      });
    }

    // Get overdue EMIs
    const overdueEmis = await EMI.getOverdueEmis(req.user._id);

    // Get missed EMIs
    const missedEmis = await EMI.getMissedEmis(req.user._id);

    // Get EMI summary
    const emiSummary = await EMI.getUserEmiSummary(req.user._id);

    const emiPayments = await EMI.getUserEmiPayments(req.user._id);

    // If no EMI schedule exists yet, but user has approved loans,
    // generate EMI schedules for all approved loans
    if (emiPayments.length === 0 && approvedLoans.length > 0) {
      for (const loan of approvedLoans) {
        try {
          const emiSchedule = await EMI.generateEmiSchedule(loan._id);
          await EMI.insertMany(emiSchedule);
        } catch (error) {
          console.error(
            `Error generating EMI schedule for loan ${loan._id}:`,
            error
          );
        }
      }
      // Fetch the newly created EMI payments
      const newEmiPayments = await EMI.getUserEmiPayments(req.user._id);

      // Group payments by loan
      const groupedPayments = {};
      newEmiPayments.forEach((payment) => {
        const loanId = payment.loanId._id.toString();
        if (!groupedPayments[loanId]) {
          groupedPayments[loanId] = {
            loanId: loanId,
            loanAmount: payment.loanId.loanDetails.loanAmount,
            interestRate: payment.loanId.loanDetails.interestRate,
            emi: payment.loanId.loanDetails.emi,
            tenure: payment.loanId.loanDetails.loanTenure,
            payments: [],
          };
        }
        groupedPayments[loanId].payments.push(payment);
      });

      // Get loan summaries
      const loanSummaries = [];
      for (const loanId of Object.keys(groupedPayments)) {
        const summary = await EMI.getLoanSummary(loanId);
        if (summary) {
          const loan = approvedLoans.find((l) => l._id.toString() === loanId);
          loanSummaries.push({
            loanId,
            loanType: loan?.loanDetails?.loanType || "Home Loan",
            loanAmount: loan?.loanDetails?.loanAmount || 0,
            ...summary,
          });
        }
      }

      return res.json({
        success: true,
        data: {
          title: "EMI Payments",
          user: req.user,
          emiPayments: Object.values(groupedPayments),
          approvedLoans,
          loanSummaries,
          emiSummary,
          overdueEmis,
          missedEmis,
          message: "Your EMI schedule has been generated successfully.",
        },
      });
    }

    // Group payments by loan
    const groupedPayments = {};
    emiPayments.forEach((payment) => {
      const loanId = payment.loanId._id.toString();
      if (!groupedPayments[loanId]) {
        groupedPayments[loanId] = {
          loanId: loanId,
          loanAmount: payment.loanId.loanDetails.loanAmount,
          interestRate: payment.loanId.loanDetails.interestRate,
          emi: payment.loanId.loanDetails.emi,
          tenure: payment.loanId.loanDetails.loanTenure,
          loanType: payment.loanId.loanDetails.loanType || "Home Loan",
          payments: [],
        };
      }
      groupedPayments[loanId].payments.push(payment);
    });

    // Get loan summaries
    const loanSummaries = [];
    for (const loanId of Object.keys(groupedPayments)) {
      const summary = await EMI.getLoanSummary(loanId);
      if (summary) {
        const loan = approvedLoans.find((l) => l._id.toString() === loanId);
        loanSummaries.push({
          loanId,
          loanType: loan?.loanDetails?.loanType || "Home Loan",
          loanAmount: loan?.loanDetails?.loanAmount || 0,
          ...summary,
        });
      }
    }

    res.json({
      success: true,
      data: {
        title: "EMI Payments",
        user: req.user,
        emiPayments: Object.values(groupedPayments),
        approvedLoans,
        loanSummaries,
        emiSummary,
        overdueEmis,
        missedEmis,
      },
    });
  } catch (error) {
    console.error("Error fetching EMI payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch EMI payments",
      error: error.message,
    });
  }
};

// Generate EMI schedule for an approved loan
const generateEmiSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if loan exists and belongs to the user
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (
      loan.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if loan is approved
    if (loan.applicationStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "EMI schedule can only be generated for approved loans",
      });
    }

    // Check if EMI schedule already exists
    const existingEmis = await EMI.find({ loanId: loanId });
    if (existingEmis.length > 0) {
      return res.status(400).json({
        success: false,
        message: "EMI schedule already exists for this loan",
      });
    }

    // Generate EMI schedule
    const emiSchedule = await EMI.generateEmiSchedule(loanId);

    // Save EMI schedule to database
    await EMI.insertMany(emiSchedule);

    res.status(201).json({
      success: true,
      message: "EMI schedule generated successfully",
      count: emiSchedule.length,
    });
  } catch (error) {
    console.error("Error generating EMI schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate EMI schedule",
      error: error.message,
    });
  }
};

// Pay EMI
const payEmi = async (req, res) => {
  try {
    const { emiId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    // Validate payment method
    if (
      !paymentMethod ||
      ![
        "credit_card",
        "debit_card",
        "net_banking",
        "upi",
        "cash",
        "auto_debit",
      ].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid payment method is required",
      });
    }

    // Find the EMI record
    const emiPayment = await EMI.findById(emiId);
    if (!emiPayment) {
      return res.status(404).json({
        success: false,
        message: "EMI payment record not found",
      });
    }

    // Check if the EMI belongs to the user
    if (emiPayment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if EMI is already paid
    if (emiPayment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This EMI has already been paid",
      });
    }

    // Update EMI payment status
    emiPayment.status = "paid";
    emiPayment.paymentDate = new Date();
    emiPayment.paymentMethod = paymentMethod;
    if (transactionId) {
      emiPayment.transactionId = transactionId;
    }

    // Add late payment fee if payment is late
    if (new Date() > emiPayment.dueDate) {
      const daysLate = Math.ceil(
        (new Date() - emiPayment.dueDate) / (1000 * 60 * 60 * 24)
      );
      const lateFee = Math.min(500, daysLate * 50); // 50 rupees per day, max 500
      emiPayment.latePaymentFee = lateFee;
      emiPayment.status = "late"; // Mark as late payment
      emiPayment.daysLate = daysLate;
    }

    await emiPayment.save();

    // Update loan status
    await EMI.updateLoanStatus(emiId);

    res.status(200).json({
      success: true,
      message: "EMI payment successful",
      emiPayment,
    });
  } catch (error) {
    console.error("Error processing EMI payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process EMI payment",
      error: error.message,
    });
  }
};

// Get all pending EMIs for a user
const getPendingEmis = async (req, res) => {
  try {
    const pendingEmis = await EMI.getPendingEmis(req.user._id);

    res.json({
      success: true,
      pendingEmis,
    });
  } catch (error) {
    console.error("Error fetching pending EMIs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending EMIs",
      error: error.message,
    });
  }
};

// Check if user has any approved loans
const hasApprovedLoans = async (req, res) => {
  try {
    const loans = await LoanApplication.find({
      userId: req.user._id,
      applicationStatus: "approved",
    });

    res.json({
      success: true,
      hasApprovedLoans: loans.length > 0,
    });
  } catch (error) {
    console.error("Error checking for approved loans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check loan status",
      error: error.message,
    });
  }
};

// Get overdue EMIs
const getOverdueEmis = async (req, res) => {
  try {
    const overdueEmis = await EMI.getOverdueEmis(req.user._id);

    res.json({
      success: true,
      overdueEmis,
    });
  } catch (error) {
    console.error("Error fetching overdue EMIs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overdue EMIs",
      error: error.message,
    });
  }
};

// Get EMI summary for user
const getEmiSummary = async (req, res) => {
  try {
    const summary = await EMI.getUserEmiSummary(req.user._id);

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching EMI summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch EMI summary",
      error: error.message,
    });
  }
};

// Get loan summary
const getLoanSummary = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if loan belongs to user
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (
      loan.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const summary = await EMI.getLoanSummary(loanId);

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Error fetching loan summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan summary",
      error: error.message,
    });
  }
};

// Get missed EMIs
const getMissedEmis = async (req, res) => {
  try {
    const missedEmis = await EMI.getMissedEmis(req.user._id);

    res.json({
      success: true,
      missedEmis,
    });
  } catch (error) {
    console.error("Error fetching missed EMIs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch missed EMIs",
      error: error.message,
    });
  }
};

// Get full EMI schedule for a loan
const getEmiSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if loan belongs to user
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (
      loan.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get EMI schedule
    const emiSchedule = await EMI.find({ loanId }).sort({ dueDate: 1 });

    res.json({
      success: true,
      loan: {
        loanAmount: loan.loanDetails.loanAmount,
        tenure: loan.loanDetails.loanTenure,
        interestRate: loan.loanDetails.interestRate,
        emi: loan.loanDetails.emi,
        loanType: loan.loanDetails.loanType,
        loanStatus: loan.loanStatus,
        paymentProgress: loan.paymentProgress,
      },
      emiSchedule,
    });
  } catch (error) {
    console.error("Error fetching EMI schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch EMI schedule",
      error: error.message,
    });
  }
};

// Admin route to check all missed payments
const checkMissedPayments = async (req, res) => {
  try {
    const missedPayments = await EMI.checkMissedPayments();

    res.json({
      success: true,
      missedCount: missedPayments.length,
      message: `${missedPayments.length} payments marked as missed`,
    });
  } catch (error) {
    console.error("Error checking missed payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check missed payments",
      error: error.message,
    });
  }
};

module.exports = {
  getEmiCalculator,
  submitLoanApplication,
  getMyApplications,
  getAdminApplications,
  updateApplicationStatus,
  getApplicationDetails,
  getMyEmis,
  generateEmiSchedule,
  payEmi,
  getPendingEmis,
  hasApprovedLoans,
  getOverdueEmis,
  getEmiSummary,
  getLoanSummary,
  getMissedEmis,
  getEmiSchedule,
  checkMissedPayments,
};
