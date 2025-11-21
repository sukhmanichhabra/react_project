const User = require("../models/user");
const { AgentModel } = require("../models");
const { authenticator } = require("otplib");
const {
  verifyToken,
  generateSecret,
  generateQRCode,
} = require("../service/twoFactor");

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

// GET Signin page - Remove this since we're using React routing
// exports.getSignin = (req, res) => {
//   // Track signin page view
//   trackActivity(req, {
//     actionType: "page_view",
//     targetType: "page",
//     targetName: "Login Page",
//   });

//   res.json({
//     success: true,
//     data: {
//       title: "Sign In",
//       showTwoFactor: false,
//     },
//   });
// };

// POST Signin
exports.postSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user and generate token
    const { user, token } = await User.matchPasswordandGenerateToken(
      email,
      password
    );

    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Store user info in session for 2FA verification
      req.session.pendingUser = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return res.json({
        success: true,
        requiresTwoFactor: true,
        data: {
          title: "Two-Factor Authentication",
          user: { email: user.email },
          showTwoFactor: true,
        },
      });
    }

    // If 2FA is not enabled, proceed with normal login
    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Track login activity
    trackActivity(req, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      actionType: "user_login",
      targetType: "user",
      targetId: user._id.toString(),
      targetName: user.name,
    });

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectUrl: "/",
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid email or password",
    });
  }
};

// POST 2FA Verification
exports.postVerify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const pendingUser = req.session.pendingUser;

    if (!pendingUser) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
        data: {
          title: "Two-Factor Authentication",
          user: { email: pendingUser.email },
          showTwoFactor: true,
        },
      });
    }

    // Get the user from database to access their secret
    const user = await User.findById(pendingUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify the token
    const isValid = verifyToken(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
        data: {
          title: "Two-Factor Authentication",
          user: { email: pendingUser.email },
          showTwoFactor: true,
        },
      });
    }

    // Clear the pending user from session
    delete req.session.pendingUser;

    // Generate auth token
    const authToken = user.generateAuthToken();

    // Set token in cookie
    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Track login activity
    trackActivity(req, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      actionType: "user_login_2fa",
      targetType: "user",
      targetId: user._id.toString(),
      targetName: user.name,
    });

    return res.json({
      success: true,
      message: "Two-factor authentication successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectUrl: "/",
      },
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};

// GET Signup page - Remove this since we're using React routing
// exports.getSignup = (req, res) => {
//   res.json({
//     success: true,
//     data: {
//       title: "Sign Up",
//     },
//   });
// };

// POST Signup
exports.postSignup = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      location,
    });

    await user.save();

    // If user is an agent, create an agent profile
    if (role === "agent") {
      try {
        await AgentModel.createAgentFromUser(user);
      } catch (agentError) {
        console.error("Error creating agent profile:", agentError);
        // Delete the user if agent creation fails
        await User.findByIdAndDelete(user._id);

        return res.status(500).json({
          success: false,
          message: "Error creating agent profile",
        });
      }
    }

    // Generate token
    const token = user.generateAuthToken();

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectUrl: "/auth/setup-2fa",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Logout
exports.logout = (req, res) => {
  // Track logout activity if user is logged in
  if (req.user) {
    trackActivity(req, {
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      actionType: "user_logout",
      targetType: "user",
      targetId: req.user._id.toString(),
      targetName: req.user.name,
    });
  }

  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out successfully",
    data: {
      redirectUrl: "/",
    },
  });
};

// GET 2FA Setup page
exports.getSetup2FA = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        redirectUrl: "/auth/signin",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        redirectUrl: "/auth/signin",
      });
    }

    // Generate new secret if user doesn't have one yet
    if (!user.twoFactorSecret) {
      const { secret, otpauth } = generateSecret(user.email);
      user.twoFactorSecret = secret;
      await user.save();

      // Generate QR code
      const qrCode = await generateQRCode(otpauth);

      return res.json({
        success: true,
        data: {
          title: "Set Up Two-Factor Authentication",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            twoFactorEnabled: user.twoFactorEnabled,
          },
          secret,
          qrCode,
        },
      });
    } else {
      // User already has a secret, generate QR code from existing secret
      const otpauth = authenticator.keyuri(
        user.email,
        "RealEstateApp",
        user.twoFactorSecret
      );
      const qrCode = await generateQRCode(otpauth);

      return res.json({
        success: true,
        data: {
          title: "Set Up Two-Factor Authentication",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            twoFactorEnabled: user.twoFactorEnabled,
          },
          secret: user.twoFactorSecret,
          qrCode,
        },
      });
    }
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to setup 2FA",
      error: error.message,
    });
  }
};

// POST Enable 2FA
exports.postEnable2FA = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        redirectUrl: "/auth/signin",
      });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA setup not initiated",
      });
    }

    // Verify token
    const isValid = verifyToken(token, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code. Please try again.",
      });
    }

    // Enable 2FA for user
    user.twoFactorEnabled = true;
    await user.save();

    // Track activity
    trackActivity(req, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      actionType: "enable_2fa",
      targetType: "user",
      targetId: user._id.toString(),
      targetName: user.name,
    });

    return res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
      data: {
        redirectUrl: "/settings?success=2fa-enabled",
      },
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enable 2FA",
      error: error.message,
    });
  }
};

// POST Disable 2FA
exports.postDisable2FA = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        redirectUrl: "/auth/signin",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    await user.save();

    // Track activity
    trackActivity(req, {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      actionType: "disable_2fa",
      targetType: "user",
      targetId: user._id.toString(),
      targetName: user.name,
    });

    return res.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
      data: {
        redirectUrl: "/settings?success=2fa-disabled",
      },
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to disable 2FA",
      error: error.message,
    });
  }
};

// GET Settings page
exports.getSettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        redirectUrl: "/auth/signin",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if request wants JSON (from React frontend)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
          },
        },
      });
    }

    // Otherwise render EJS view
    res.render('settings', {
      title: 'Account Settings',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Settings page error:", error);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: "Failed to load settings",
        error: error.message,
      });
    }

    res.status(500).render('error', {
      message: 'Failed to load settings',
      error: error.message,
    });
  }
};
