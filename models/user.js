const mongoose = require('mongoose');
const crypto = require('crypto');
const { createToken } = require('../service/auth');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    salt: {
        type: String
    },
    twoFactorSecret: {
        type: String,
        default: null
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['buyer', 'agent', 'seller', 'admin'],
        default: 'buyer'
    },
    phone: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: '/images/default-avatar.png'
    },
    website: {
        type: String,
        trim: true
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    accountBalance: {
        type: Number,
        default: 0
    },
    loanRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanApplication'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
    return createToken(this);
};

userSchema.static("matchPasswordandGenerateToken", async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found");
    
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvided = crypto.createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if(hashedPassword !== userProvided) throw new Error("Incorrect Password");

    const token = createToken(user);
    return { user, token };
});

userSchema.pre("save", function(next) {
    const user = this;
    if(!user.isModified("password")) return next();

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
