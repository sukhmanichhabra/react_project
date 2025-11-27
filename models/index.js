// Import models
const PropertyModel = require('./property');
const AgentModel = require('./agent');
const UserModel = require('./user');
const TransactionModel = require('./transaction');
const MessageModel = require('./message');
const { LoanApplication } = require('./loanApplication');
const AdvertisingModel = require('./advertising');
const RentModel = require('./rent');
const { ChatModel } = require('./chat');
const { VisitModel } = require('./visit');
const NotificationModel = require('./notification');
const AgreementModel = require('./agreement');

// Set up model relationships
PropertyModel.setAgentModel(AgentModel);
PropertyModel.setUserModel(UserModel);

// Initialize property assignments
AgentModel.initializePropertyAssignments();

// Export models
module.exports = {
    PropertyModel,
    AgentModel,
    UserModel,
    TransactionModel,
    MessageModel,
    LoanApplication,
    AdvertisingModel,
    RentModel,
    ChatModel,
    VisitModel,
    NotificationModel,
    AgreementModel
};