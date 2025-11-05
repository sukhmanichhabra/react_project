const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanApplication',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentDate: {
        type: Date
    },
    dueDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    principalAmount: {
        type: Number,
        required: true
    },
    interestAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'late', 'missed', 'partial'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash', 'auto_debit'],
        required: function() {
            return this.status === 'paid' || this.status === 'late' || this.status === 'partial';
        }
    },
    transactionId: {
        type: String
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    paymentMonth: {
        type: Number,
        required: true
    },
    paymentYear: {
        type: Number,
        required: true
    },
    latePaymentFee: {
        type: Number,
        default: 0
    },
    isPenalized: {
        type: Boolean,
        default: false
    },
    daysLate: {
        type: Number,
        default: 0
    },
    missedInstallmentCount: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    },
    emiNumber: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Static methods
emiSchema.statics.getUserEmiPayments = function(userId) {
    return this.find({ userId })
        .populate('loanId', 'loanDetails.loanAmount loanDetails.loanTenure loanDetails.interestRate loanDetails.emi')
        .sort({ dueDate: 1 });
};

emiSchema.statics.getPendingEmis = function(userId) {
    return this.find({ 
        userId,
        status: 'pending',
        dueDate: { $gte: new Date() }
    })
    .populate('loanId', 'loanDetails.loanAmount loanDetails.loanTenure loanDetails.interestRate loanDetails.emi applicationStatus')
    .sort({ dueDate: 1 });
};

emiSchema.statics.generateEmiSchedule = async function(loanId) {
    try {
        const LoanApplication = mongoose.model('LoanApplication');
        const loan = await LoanApplication.findById(loanId);
        
        if (!loan || loan.applicationStatus !== 'approved') {
            throw new Error('Loan not found or not approved');
        }
        
        // Get loan details
        const loanAmount = loan.loanDetails.loanAmount;
        const loanTenure = loan.loanDetails.loanTenure; 
        const interestRate = loan.loanDetails.interestRate;
        
        // Calculate EMI - Formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
        const totalMonths = loanTenure * 12; // Convert years to months
        const monthlyInterestRate = interestRate / 12 / 100;
        
        const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                    (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
        
        // Save EMI value to loan details
        loan.loanDetails.emi = Math.round(emi);
        
        let remainingBalance = loanAmount;
        let emiSchedule = [];
        
        // Create EMI schedule for the full loan tenure
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        for (let i = 0; i < totalMonths; i++) {
            const dueMonth = (currentMonth + i + 1) % 12;
            const dueYear = currentYear + Math.floor((currentMonth + i + 1) / 12);
            
            // Calculate interest for this period
            const interestPayment = remainingBalance * monthlyInterestRate;
            
            // Calculate principal payment for this period (EMI - interest)
            const principalPayment = emi - interestPayment;
            
            // Update remaining balance
            remainingBalance = Math.max(0, remainingBalance - principalPayment);
            
            // Set due date to 5th of each month
            const dueDate = new Date(dueYear, dueMonth, 5);
            
            const emiPayment = {
                loanId: loan._id,
                userId: loan.userId,
                dueDate,
                amount: Math.round(emi),
                principalAmount: Math.round(principalPayment),
                interestAmount: Math.round(interestPayment),
                remainingBalance: Math.round(remainingBalance),
                paymentMonth: dueMonth + 1,
                paymentYear: dueYear,
                status: 'pending',
                paymentMethod: 'credit_card', // Default payment method
                emiNumber: i + 1 // Add EMI number for tracking
            };
            
            emiSchedule.push(emiPayment);
        }
        
        // Update loan status and totalEMIs in loanApplication
        loan.loanStatus = 'in_progress';
        loan.paymentProgress = {
            totalPaid: 0,
            totalPrincipalPaid: 0,
            totalInterestPaid: 0,
            remainingPrincipal: loanAmount,
            completedEMIs: 0,
            totalEMIs: totalMonths
        };
        await loan.save();
        
        return emiSchedule;
    } catch (error) {
        console.error('Error generating EMI schedule:', error);
        throw error;
    }
};

// Get EMI payments by status
emiSchema.statics.getEmisByStatus = function(userId, status) {
    return this.find({ 
        userId,
        status 
    })
    .populate('loanId', 'loanDetails.loanAmount loanDetails.loanTenure loanDetails.interestRate loanDetails.emi loanDetails.loanType applicationStatus')
    .sort({ dueDate: 1 });
};

// Get overdue EMIs
emiSchema.statics.getOverdueEmis = function(userId) {
    const today = new Date();
    return this.find({ 
        userId,
        status: 'pending',
        dueDate: { $lt: today }
    })
    .populate('loanId', 'loanDetails.loanAmount loanDetails.loanTenure loanDetails.interestRate loanDetails.emi loanDetails.loanType applicationStatus')
    .sort({ dueDate: 1 });
};

// Get EMI summary statistics for user
emiSchema.statics.getUserEmiSummary = async function(userId) {
    const today = new Date();
    
    // Get counts
    const totalEmis = await this.countDocuments({ userId });
    const paidEmis = await this.countDocuments({ userId, status: { $in: ['paid', 'late'] } });
    const pendingEmis = await this.countDocuments({ userId, status: 'pending' });
    const overdueEmis = await this.countDocuments({ 
        userId, 
        status: 'pending',
        dueDate: { $lt: today }
    });
    
    // Get total amounts - use proper ObjectId for userId
    const userIdStr = userId.toString();
    const paidAmountResult = await this.aggregate([
        { $match: { 
            userId: new mongoose.Types.ObjectId(userIdStr), 
            status: { $in: ['paid', 'late'] } 
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingAmountResult = await this.aggregate([
        { $match: { 
            userId: new mongoose.Types.ObjectId(userIdStr), 
            status: 'pending' 
        }},
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const paidAmount = paidAmountResult.length > 0 ? paidAmountResult[0].total : 0;
    const pendingAmount = pendingAmountResult.length > 0 ? pendingAmountResult[0].total : 0;
    
    // Get next due EMI
    const nextDueEmi = await this.findOne({
        userId,
        status: 'pending',
        dueDate: { $gte: today }
    }).sort({ dueDate: 1 });
    
    // Calculate payment progress safely
    let paymentProgress = 0;
    if (totalEmis > 0) {
        paymentProgress = (paidEmis / totalEmis) * 100;
    } else if (paidEmis > 0) {
        // If we have paid EMIs but total count is 0 (potential bug), set progress based on paid EMIs
        paymentProgress = (paidEmis / (paidEmis + pendingEmis)) * 100;
    }
    
    return {
        totalEmis,
        paidEmis,
        pendingEmis,
        overdueEmis,
        paidAmount,
        pendingAmount,
        nextDueEmi,
        paymentProgress
    };
};

// Get loan summary based on EMI payments
emiSchema.statics.getLoanSummary = async function(loanId) {
    const emis = await this.find({ loanId });
    
    if (emis.length === 0) {
        return null;
    }
    
    const totalPaid = emis
        .filter(emi => emi.status === 'paid' || emi.status === 'late')
        .reduce((sum, emi) => sum + emi.amount, 0);
    
    const totalPrincipalPaid = emis
        .filter(emi => emi.status === 'paid' || emi.status === 'late')
        .reduce((sum, emi) => sum + emi.principalAmount, 0);
    
    const totalInterestPaid = emis
        .filter(emi => emi.status === 'paid' || emi.status === 'late')
        .reduce((sum, emi) => sum + emi.interestAmount, 0);
    
    const totalLatePaymentFees = emis
        .filter(emi => emi.status === 'late')
        .reduce((sum, emi) => sum + (emi.latePaymentFee || 0), 0);
    
    const lastPaidEmi = [...emis]
        .filter(emi => emi.status === 'paid' || emi.status === 'late')
        .sort((a, b) => b.paymentDate - a.paymentDate)[0];
    
    return {
        totalPaid,
        totalPrincipalPaid,
        totalInterestPaid,
        totalLatePaymentFees,
        lastPaidEmi,
        paidEmiCount: emis.filter(emi => emi.status === 'paid' || emi.status === 'late').length,
        pendingEmiCount: emis.filter(emi => emi.status === 'pending').length,
        remainingBalance: emis.find(emi => emi.status === 'pending')?.remainingBalance || 0
    };
};

// Update loan status after EMI payment
emiSchema.statics.updateLoanStatus = async function(emiId) {
    try {
        const emi = await this.findById(emiId);
        if (!emi) {
            throw new Error('EMI not found');
        }
        
        const LoanApplication = mongoose.model('LoanApplication');
        const loan = await LoanApplication.findById(emi.loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }
        
        // Count total paid EMIs
        const paidEmis = await this.countDocuments({
            loanId: emi.loanId,
            status: { $in: ['paid', 'late'] }
        });
        
        // Get total amounts
        const paidAmountResult = await this.aggregate([
            { $match: { 
                loanId: new mongoose.Types.ObjectId(emi.loanId), 
                status: { $in: ['paid', 'late'] } 
            }},
            { $group: { 
                _id: null, 
                totalPaid: { $sum: '$amount' },
                totalPrincipal: { $sum: '$principalAmount' },
                totalInterest: { $sum: '$interestAmount' }
            }}
        ]);
        
        // Calculate remaining balance
        const totalPaid = paidAmountResult.length > 0 ? paidAmountResult[0].totalPaid : 0;
        const totalPrincipalPaid = paidAmountResult.length > 0 ? paidAmountResult[0].totalPrincipal : 0;
        const totalInterestPaid = paidAmountResult.length > 0 ? paidAmountResult[0].totalInterest : 0;
        const remainingPrincipal = loan.loanDetails.loanAmount - totalPrincipalPaid;
        
        // Update loan payment progress
        loan.paymentProgress = {
            totalPaid,
            totalPrincipalPaid,
            totalInterestPaid,
            remainingPrincipal,
            completedEMIs: paidEmis,
            totalEMIs: loan.paymentProgress.totalEMIs
        };
        
        // Check if loan is fully paid
        const totalEMIs = loan.loanDetails.loanTenure * 12;
        if (paidEmis >= totalEMIs) {
            loan.loanStatus = 'fully_paid';
        } else {
            loan.loanStatus = 'in_progress';
        }
        
        // Check for missed payments/defaults
        const missedPayments = await this.countDocuments({
            loanId: emi.loanId,
            status: 'missed'
        });
        
        if (missedPayments > 3) {
            loan.loanStatus = 'defaulted';
        }
        
        await loan.save();
        return loan;
    } catch (error) {
        console.error('Error updating loan status:', error);
        throw error;
    }
};

// Update monthly check for missed payments
emiSchema.statics.checkMissedPayments = async function() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Find overdue EMIs that haven't been paid and are more than 30 days past due
    const overdueEmis = await this.find({
        status: 'pending',
        dueDate: { $lt: thirtyDaysAgo }
    });
    
    for (const emi of overdueEmis) {
        // Mark as missed
        emi.status = 'missed';
        emi.missedInstallmentCount = 1;
        emi.daysLate = Math.ceil((today - emi.dueDate) / (1000 * 60 * 60 * 24));
        emi.latePaymentFee = Math.min(1000, emi.daysLate * 50); // 50 rupees per day, max 1000
        emi.isPenalized = true;
        
        await emi.save();
        
        // Update loan status
        try {
            await this.updateLoanStatus(emi._id);
        } catch (error) {
            console.error('Error updating loan status:', error);
        }
    }
    
    return overdueEmis;
};

// Get missed EMIs
emiSchema.statics.getMissedEmis = function(userId) {
    return this.find({ 
        userId,
        status: 'missed'
    })
    .populate('loanId', 'loanDetails.loanAmount loanDetails.loanTenure loanDetails.interestRate loanDetails.emi loanDetails.loanType applicationStatus')
    .sort({ dueDate: 1 });
};

const EMI = mongoose.model('EMI', emiSchema);

module.exports = EMI;
