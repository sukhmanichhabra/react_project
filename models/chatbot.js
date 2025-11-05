const mongoose = require('mongoose');

// Schema for chatbot questions and answers
const chatbotQASchema = new mongoose.Schema({
    // The question or query from the user
    question: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // The answer or response to the question
    answer: {
        type: String,
        required: true,
        trim: true
    },
    // Keywords to help with matching questions
    keywords: [{
        type: String,
        trim: true
    }],
    // Categories to organize questions
    category: {
        type: String,
        required: true,
        enum: ['general', 'property', 'buying', 'selling', 'renting', 'loan', 'agent', 'account'],
        default: 'general'
    },
    // Priority for ordering responses (higher numbers = higher priority)
    priority: {
        type: Number,
        default: 0
    },
    // Whether this is an active question/answer
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for search functionality
chatbotQASchema.index({ 
    question: 'text', 
    keywords: 'text'
});

// Create model
const ChatbotQA = mongoose.model('ChatbotQA', chatbotQASchema);

// Chat session to track user interactions with the chatbot
const chatbotSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interactions: [{
        query: String,
        response: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastInteractionAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Create model
const ChatbotSession = mongoose.model('ChatbotSession', chatbotSessionSchema);

// Helper methods for chatbot operations
const ChatbotModel = {
    // Find answer for a question
    findAnswer: async function(question) {
        try {
            // First try exact match
            let qa = await ChatbotQA.findOne({
                question: new RegExp(`^${question}$`, 'i')
            }).sort({ priority: -1 });

            if (qa) return qa;
            
            // Try text search with keywords
            qa = await ChatbotQA.findOne({
                $text: { $search: question }
            }).sort({ score: { $meta: "textScore" }, priority: -1 });
            
            if (qa) return qa;
            
            // Fallback: find by partial match
            qa = await ChatbotQA.findOne({
                question: new RegExp(question.split(' ').filter(word => word.length > 3).join('|'), 'i')
            }).sort({ priority: -1 });
            
            return qa;
        } catch (error) {
            console.error('Error finding answer:', error);
            return null;
        }
    },
    
    // Create a new question and answer pair
    createQA: async function(qaData) {
        try {
            const qa = new ChatbotQA(qaData);
            await qa.save();
            return qa;
        } catch (error) {
            console.error('Error creating QA:', error);
            throw error;
        }
    },
    
    // Update an existing question and answer
    updateQA: async function(id, qaData) {
        try {
            qaData.updatedAt = Date.now();
            const qa = await ChatbotQA.findByIdAndUpdate(id, qaData, { new: true });
            return qa;
        } catch (error) {
            console.error('Error updating QA:', error);
            throw error;
        }
    },
    
    // Delete a question and answer
    deleteQA: async function(id) {
        try {
            await ChatbotQA.findByIdAndDelete(id);
            return true;
        } catch (error) {
            console.error('Error deleting QA:', error);
            throw error;
        }
    },
    
    // Get all questions and answers
    getAllQA: async function(category = null) {
        try {
            const query = { isActive: true };
            if (category) query.category = category;
            
            const qas = await ChatbotQA.find(query).sort({ category: 1, priority: -1 });
            return qas;
        } catch (error) {
            console.error('Error getting all QAs:', error);
            throw error;
        }
    },
    
    // Record a user interaction with the chatbot
    recordInteraction: async function(userId, query, response) {
        try {
            // Find active session or create new one
            let session = await ChatbotSession.findOne({
                userId,
                isActive: true
            });
            
            if (!session) {
                session = new ChatbotSession({
                    userId,
                    interactions: []
                });
            }
            
            // Add interaction
            session.interactions.push({
                query,
                response,
                timestamp: Date.now()
            });
            
            session.lastInteractionAt = Date.now();
            await session.save();
            
            return session;
        } catch (error) {
            console.error('Error recording interaction:', error);
            throw error;
        }
    },
    
    // Get default responses
    getDefaultResponse: function() {
        const defaultResponses = [
            "I'm sorry, I don't have the answer to that question right now.",
            "I don't understand that question. Could you rephrase it?",
            "I couldn't find an answer to your question. Would you like to talk to a human agent?",
            "I'm still learning! That question is beyond my current knowledge.",
            "I'm not sure about that. Could you try asking another way?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
};

// Initialize default questions and answers if none exist
const initializeDefaultQA = async () => {
    try {
        const count = await ChatbotQA.countDocuments();
        if (count === 0) {
            // Add default QA pairs
            const defaultQAs = [
                // General questions
                {
                    question: "What is this website?",
                    answer: "This is a real estate platform where you can buy, sell, or rent properties, get loans, and connect with agents.",
                    keywords: ["website", "platform", "about", "info"],
                    category: "general",
                    priority: 5
                },
                {
                    question: "How can I contact customer support?",
                    answer: "You can contact customer support by clicking on the 'Contact Us' link at the bottom of the page or by emailing support@realestate.com.",
                    keywords: ["contact", "support", "help", "email"],
                    category: "general",
                    priority: 5
                },
                
                // Property questions
                {
                    question: "How do I search for properties?",
                    answer: "You can search for properties by using the search bar at the top of the page. You can filter by location, price, number of bedrooms, and more.",
                    keywords: ["search", "find", "property", "filter"],
                    category: "property",
                    priority: 4
                },
                {
                    question: "Can I compare properties?",
                    answer: "Yes, you can compare properties by clicking the 'Compare' button on property listings. You can compare up to 3 properties at once.",
                    keywords: ["compare", "comparison", "properties"],
                    category: "property",
                    priority: 3
                },
                
                // Buying questions
                {
                    question: "How do I make an offer on a property?",
                    answer: "To make an offer on a property, you need to be registered as a buyer. Then, navigate to the property listing and click the 'Make Offer' button. Follow the steps to submit your offer.",
                    keywords: ["offer", "buy", "purchase", "property"],
                    category: "buying",
                    priority: 5
                },
                {
                    question: "What fees are involved in buying a property?",
                    answer: "Buying a property typically involves several fees including agent commission, legal fees, stamp duty, inspection costs, and mortgage fees. The exact amounts vary by location and property value.",
                    keywords: ["fees", "costs", "buying", "purchase"],
                    category: "buying",
                    priority: 4
                },
                
                // Selling questions
                {
                    question: "How do I list my property for sale?",
                    answer: "To list your property for sale, register as a seller, then click on 'My Properties' in your dashboard. Click 'Add New Property' and fill out the details about your property.",
                    keywords: ["sell", "list", "listing", "property"],
                    category: "selling",
                    priority: 5
                },
                {
                    question: "How much does it cost to sell a property?",
                    answer: "The cost to sell a property includes listing fees, agent commission (typically 2-3% of the sale price), legal fees, and potential advertising costs. You can choose different advertising packages on our platform.",
                    keywords: ["cost", "fee", "sell", "selling"],
                    category: "selling",
                    priority: 4
                },
                
                // Renting questions
                {
                    question: "How do I apply for a rental property?",
                    answer: "To apply for a rental property, navigate to the property listing and click 'Apply to Rent'. You'll need to fill out an application form and provide identification and proof of income.",
                    keywords: ["rent", "rental", "apply", "application"],
                    category: "renting",
                    priority: 5
                },
                {
                    question: "What is included in the rent?",
                    answer: "What's included in the rent varies by property. Generally, rent covers the basic property usage, but utilities, internet, and other services may or may not be included. Check the property listing for details.",
                    keywords: ["rent", "include", "utilities", "covered"],
                    category: "renting",
                    priority: 4
                },
                
                // Loan questions
                {
                    question: "How do I apply for a loan?",
                    answer: "To apply for a loan, go to the 'Loans' section and click 'Apply for Loan'. You'll need to provide personal information, financial details, and property information. Our system will evaluate your application.",
                    keywords: ["loan", "apply", "mortgage", "finance"],
                    category: "loan",
                    priority: 5
                },
                {
                    question: "What interest rates do you offer?",
                    answer: "Our interest rates vary based on loan type, amount, and your credit score. Current rates range from 3.5% to 6.5%. You can use our EMI calculator to estimate your monthly payments.",
                    keywords: ["interest", "rate", "loan", "mortgage"],
                    category: "loan",
                    priority: 4
                },
                
                // Agent questions
                {
                    question: "How do I find a real estate agent?",
                    answer: "You can find a real estate agent by going to the 'Agents' section and browsing available agents. You can filter by location, specialization, and ratings to find the right match for your needs.",
                    keywords: ["agent", "realtor", "find", "contact"],
                    category: "agent",
                    priority: 4
                },
                {
                    question: "How do I become an agent on your platform?",
                    answer: "To become an agent on our platform, go to 'Sign Up' and select 'Agent'. You'll need to provide professional details, references, and licensing information. Our team will review your application.",
                    keywords: ["become", "agent", "realtor", "register"],
                    category: "agent",
                    priority: 3
                },
                
                // Account questions
                {
                    question: "How do I create an account?",
                    answer: "To create an account, click 'Sign Up' in the top right corner of the page. Fill out the registration form with your details and select your account type (buyer, seller, or agent).",
                    keywords: ["account", "create", "register", "signup"],
                    category: "account",
                    priority: 5
                },
                {
                    question: "How do I reset my password?",
                    answer: "To reset your password, click 'Login', then 'Forgot Password'. Enter your email address, and we'll send you a link to reset your password.",
                    keywords: ["password", "reset", "forgot", "recover"],
                    category: "account",
                    priority: 5
                }
            ];
            
            for (const qa of defaultQAs) {
                await ChatbotModel.createQA(qa);
            }
            
            console.log('Initialized default chatbot Q&A');
        }
    } catch (error) {
        console.error('Error initializing default QA:', error);
    }
};

// Call initialization
initializeDefaultQA();

module.exports = {
    ChatbotQA,
    ChatbotSession,
    ChatbotModel
}; 