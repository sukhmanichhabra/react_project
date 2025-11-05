const mongoose = require('mongoose');
const { Visit, VisitModel } = require('../models/visit');
const EMI = require('../models/emi');
const NotificationService = require('./notificationService');
const cron = require('node-cron');

/**
 * Auto-complete scheduler for property visits
 * Automatically marks visits as completed if their scheduled date has passed
 */
const VisitScheduler = {
    /**
     * Process visits that need to be auto-completed
     * Looks for approved visits with dates in the past
     */
    processOverdueVisits: async () => {
        try {
            console.log('Running auto-completion of past visits...');
            
            const today = new Date();
            
            // Find all approved visits that have past dates and are not completed yet
            const overdueVisits = await Visit.find({
                status: 'approved',
                visitDate: { $lt: today } // Visits with dates before today
            });
            
            console.log(`Found ${overdueVisits.length} overdue visits to mark as completed`);
            
            // Update all these visits to completed status
            for (const visit of overdueVisits) {
                await VisitModel.updateVisit(visit._id, { 
                    status: 'completed',
                    agentNotes: visit.agentNotes 
                        ? visit.agentNotes + '\n[System] Automatically marked as completed as the visit date has passed.'
                        : '[System] Automatically marked as completed as the visit date has passed.'
                });
                console.log(`Auto-completed visit ID: ${visit._id}`);
            }
            
            return {
                success: true,
                processedCount: overdueVisits.length
            };
        } catch (error) {
            console.error('Error auto-completing visits:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * Initialize the scheduler to run at regular intervals
     * @param {number} intervalMinutes - How often to check for overdue visits (in minutes)
     */
    initScheduler: (intervalMinutes = 60) => {
        console.log(`Initializing visit auto-completion scheduler to run every ${intervalMinutes} minutes`);
        
        // Schedule job using node-cron (default: every hour)
        // Format: '*/interval * * * *' = run every 'interval' minutes
        cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
            console.log('Running scheduled visit update job...');
            await VisitScheduler.processScheduledTasks();
        });
        
        // Run immediately on startup
        VisitScheduler.processScheduledTasks();
    },
    
    async processScheduledTasks() {
        try {
            // Auto-complete past visits
            await VisitScheduler.autoCompletePastVisits();
            
            // Check for upcoming visits and send reminders
            await VisitScheduler.sendVisitReminders();
            
            // Check for due EMI payments
            await VisitScheduler.checkEmiDuePayments();
            
            console.log('Scheduled visit tasks completed successfully');
        } catch (error) {
            console.error('Error in scheduled visit tasks:', error);
        }
    },
    
    async autoCompletePastVisits() {
        try {
            const result = await VisitScheduler.processOverdueVisits();
            if (result.modifiedCount > 0) {
                console.log(`Auto-completed ${result.modifiedCount} past visits`);
            }
            return result;
        } catch (error) {
            console.error('Error auto-completing past visits:', error);
            throw error;
        }
    },
    
    async sendVisitReminders() {
        try {
            // Get visits scheduled for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            
            const upcomingVisits = await Visit.find({
                visitDate: { $gte: tomorrow, $lt: dayAfter },
                status: 'approved',
                reminderSent: false
            }).populate('property').populate('buyer');
            
            for (const visit of upcomingVisits) {
                // Send notification to buyer
                if (visit.buyer) {
                    await NotificationService.visitStatusChange({
                        userId: visit.buyer._id,
                        visitId: visit._id,
                        propertyTitle: visit.property.title || 'Property',
                        status: 'scheduled',
                        visitDate: visit.visitDate
                    });
                    
                    console.log(`Sent visit reminder notification to buyer ${visit.buyer._id} for visit ${visit._id}`);
                }
                
                // Mark reminder as sent
                visit.reminderSent = true;
                await visit.save();
            }
            
            if (upcomingVisits.length > 0) {
                console.log(`Sent reminders for ${upcomingVisits.length} upcoming visits`);
            }
            
            return upcomingVisits;
        } catch (error) {
            console.error('Error sending visit reminders:', error);
            throw error;
        }
    },
    
    async checkEmiDuePayments() {
        try {
            // Get EMIs due in the next 3 days
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const threeDaysLater = new Date(today);
            threeDaysLater.setDate(threeDaysLater.getDate() + 3);
            
            const dueEmis = await EMI.find({
                dueDate: { $gte: today, $lt: threeDaysLater },
                status: 'pending',
                reminderSent: { $ne: true }
            }).populate('loanId').populate({
                path: 'userId',
                select: '_id name email'
            });
            
            for (const emi of dueEmis) {
                if (!emi.userId || !emi.loanId) continue;
                
                // Get property info from loan
                let propertyTitle = "your property";
                if (emi.loanId.loanDetails && emi.loanId.loanDetails.propertyAddress) {
                    propertyTitle = emi.loanId.loanDetails.propertyAddress.substring(0, 30) + "...";
                }
                
                // Send notification for upcoming EMI payment
                await NotificationService.emiDue({
                    userId: emi.userId._id,
                    emiId: emi._id,
                    loanId: emi.loanId._id,
                    propertyTitle,
                    dueDate: emi.dueDate,
                    amount: emi.amount
                });
                
                // Mark reminder as sent
                emi.reminderSent = true;
                await emi.save();
                
                console.log(`Sent EMI due notification to user ${emi.userId._id} for EMI ${emi._id}`);
            }
            
            if (dueEmis.length > 0) {
                console.log(`Sent reminders for ${dueEmis.length} upcoming EMI payments`);
            }
            
            return dueEmis;
        } catch (error) {
            console.error('Error checking EMI due payments:', error);
            throw error;
        }
    }
};

module.exports = VisitScheduler; 