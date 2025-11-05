const {
  ChatbotModel,
  ChatbotQA,
  ChatbotSession,
} = require("../models/chatbot");

// Main chatbot page
const getChatbotPage = async (req, res) => {
  try {
    // Get categories for the sidebar
    const categories = [
      { id: "general", name: "General Questions", icon: "fa-question-circle" },
      { id: "property", name: "Property", icon: "fa-home" },
      { id: "buying", name: "Buying", icon: "fa-shopping-cart" },
      { id: "selling", name: "Selling", icon: "fa-tag" },
      { id: "renting", name: "Renting", icon: "fa-key" },
      { id: "loan", name: "Loans", icon: "fa-money-bill" },
      { id: "agent", name: "Agents", icon: "fa-user-tie" },
      { id: "account", name: "Account", icon: "fa-user-circle" },
    ];

    // Get suggested questions for quick start
    const popularQuestions = await ChatbotQA.find({ isActive: true })
      .sort({ priority: -1 })
      .limit(5);

    // If user is logged in, get their chat history
    let chatHistory = [];
    if (req.user) {
      const session = await ChatbotSession.findOne({
        userId: req.user._id,
        isActive: true,
      }).sort({ lastInteractionAt: -1 });

      if (session) {
        chatHistory = session.interactions.slice(-5).reverse();
      }
    }

    res.json({
      success: true,
      data: {
        title: "AI Chatbot Assistant",
        categories,
        popularQuestions,
        chatHistory,
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error rendering chatbot page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load chatbot",
      error: error.message,
    });
  }
};

// Get questions by category
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await ChatbotQA.find({
      category,
      isActive: true,
    }).sort({ priority: -1 });

    res.json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching category questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
};

// Submit a question (API endpoint)
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Find answer in database
    const qa = await ChatbotModel.findAnswer(question);

    let answer;
    if (qa) {
      answer = qa.answer;
    } else {
      answer = ChatbotModel.getDefaultResponse();
    }

    // Record interaction if user is logged in
    if (req.user) {
      await ChatbotModel.recordInteraction(req.user._id, question, answer);
    }

    // Get related questions for follow-up
    const relatedQuestions = await ChatbotQA.find({
      $text: { $search: question },
      _id: { $ne: qa ? qa._id : null },
    })
      .sort({ priority: -1 })
      .limit(3);

    res.json({
      success: true,
      answer,
      relatedQuestions: relatedQuestions.map((q) => ({
        id: q._id,
        question: q.question,
      })),
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process question",
    });
  }
};

// Admin chatbot management page
const getAdminPage = async (req, res) => {
  try {
    const category = req.query.category || null;
    const qas = await ChatbotModel.getAllQA(category);

    res.json({
      success: true,
      data: {
        title: "Manage Chatbot Q&A",
        qas,
        currentCategory: category,
        categories: [
          { id: "general", name: "General Questions" },
          { id: "property", name: "Property" },
          { id: "buying", name: "Buying" },
          { id: "selling", name: "Selling" },
          { id: "renting", name: "Renting" },
          { id: "loan", name: "Loans" },
          { id: "agent", name: "Agents" },
          { id: "account", name: "Account" },
        ],
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Error rendering admin page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin page",
      error: error.message,
    });
  }
};

// Add new Q&A
const addQA = async (req, res) => {
  try {
    const { question, answer, keywords, category, priority } = req.body;

    // Validate required fields
    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: "Question, answer, and category are required",
      });
    }

    // Parse keywords string into array
    const keywordsArray = keywords
      ? keywords.split(",").map((k) => k.trim())
      : [];

    // Create new QA
    await ChatbotModel.createQA({
      question,
      answer,
      keywords: keywordsArray,
      category,
      priority: parseInt(priority || 0, 10),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding QA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add Q&A",
    });
  }
};

// Update existing Q&A
const updateQA = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, keywords, category, priority, isActive } =
      req.body;

    // Validate required fields
    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: "Question, answer, and category are required",
      });
    }

    // Parse keywords string into array
    const keywordsArray = keywords
      ? keywords.split(",").map((k) => k.trim())
      : [];

    // Update QA
    await ChatbotModel.updateQA(id, {
      question,
      answer,
      keywords: keywordsArray,
      category,
      priority: parseInt(priority || 0, 10),
      isActive: isActive === "true" || isActive === true,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating QA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update Q&A",
    });
  }
};

// Get single Q&A by ID
const getQAById = async (req, res) => {
  try {
    const { id } = req.params;
    const qa = await ChatbotQA.findById(id);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      qa,
    });
  } catch (error) {
    console.error("Error fetching QA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question details",
    });
  }
};

// Delete Q&A
const deleteQA = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatbotModel.deleteQA(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting QA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Q&A",
    });
  }
};

// Get user chat sessions (for admin dashboard)
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatbotSession.find()
      .sort({ lastInteractionAt: -1 })
      .limit(100)
      .populate("userId", "name email");

    res.json({ success: true, sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
};

module.exports = {
  getChatbotPage,
  getQuestionsByCategory,
  askQuestion,
  getAdminPage,
  addQA,
  updateQA,
  getQAById,
  deleteQA,
  getChatSessions,
};
