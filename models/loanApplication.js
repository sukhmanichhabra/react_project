const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicantName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced'],
        required: true
    },
    employmentDetails: {
        employmentType: {
            type: String,
            enum: ['salaried', 'self-employed', 'business'],
            required: true
        },
        monthlyIncome: {
            type: Number,
            required: true
        },
        workExperience: {
            type: Number,
            required: true
        },
        employerName: {
            type: String
        },
        designation: {
            type: String
        }
    },
    loanDetails: {
        loanAmount: {
            type: Number,
            required: true
        },
        loanTenure: {
            type: Number,
            required: true
        },
        interestRate: {
            type: Number,
            default: 8.5
        },
        emi: {
            type: Number
        },
        propertyType: {
            type: String,
            enum: ['apartment', 'independent', 'villa', 'plot'],
            required: true
        },
        loanType: {
            type: String,
            enum: ['affordable', 'premium', 'luxury', 'construction', 'renovation'],
            required: true
        },
        propertyValue: {
            type: Number
        },
        propertyAddress: {
            type: String
        }
    },
    documents: {
        identityProof: {
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        },
        addressProof: {
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        },
        incomeProof: {
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        },
        propertyDocuments: {
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        },
        bankStatements: {
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        },
        additionalDocs: [{
            path: String,
            originalName: String,
            mimeType: String,
            uploadedAt: Date
        }]
    },
    applicationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'disbursed'],
        default: 'pending'
    },
    adminRemarks: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    disbursementDetails: {
        disbursementDate: Date,
        accountNumber: String,
        bankName: String,
        transactionId: String,
        amount: Number
    },
    loanStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'fully_paid', 'defaulted'],
        default: 'not_started'
    },
    paymentProgress: {
        totalPaid: {
            type: Number,
            default: 0
        },
        totalPrincipalPaid: {
            type: Number,
            default: 0
        },
        totalInterestPaid: {
            type: Number,
            default: 0
        },
        remainingPrincipal: {
            type: Number,
            default: 0
        },
        completedEMIs: {
            type: Number,
            default: 0
        },
        totalEMIs: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

// Calculate EMI when saving a loan application
loanApplicationSchema.pre('save', function(next) {
    if (this.loanDetails.loanAmount && this.loanDetails.loanTenure && this.loanDetails.interestRate) {
        const monthlyInterest = this.loanDetails.interestRate / 12 / 100;
        const totalMonths = this.loanDetails.loanTenure * 12;
        
        const emi = (this.loanDetails.loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) / 
                    (Math.pow(1 + monthlyInterest, totalMonths) - 1);
        
        this.loanDetails.emi = Math.round(emi);
    }
    next();
});

// Static methods
loanApplicationSchema.statics.getPendingApplications = function() {
    return this.find({ applicationStatus: 'pending' })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
};

loanApplicationSchema.statics.getApplicationsByUser = function(userId) {
    return this.find({ userId })
        .sort({ createdAt: -1 });
};

// Static method to get loan application stats
loanApplicationSchema.statics.getApplicationStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$applicationStatus',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Transform the results into a more usable format
    const result = {
        pending: 0,
        under_review: 0,
        approved: 0,
        rejected: 0,
        disbursed: 0,
        total: 0
    };
    
    stats.forEach(item => {
        if (result.hasOwnProperty(item._id)) {
            result[item._id] = item.count;
        }
        result.total += item.count;
    });
    
    return result;
};

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);

module.exports = {
    LoanApplication
}; 