const { validateToken } = require("../service/auth");
const User = require('../models/user');
const jwt = require('jsonwebtoken');

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        
        if (!tokenCookieValue) {
            // No token cookie found, continue without authentication
            req.user = null;
            res.locals.user = null;
            return next();
        }

        try {
            // Validate token and extract user information
            const userPayload = validateToken(tokenCookieValue);
            
            // Set user info in request and locals
            req.user = userPayload;
            res.locals.user = userPayload;
            
            // Add notification count for authenticated users
            if (req.user) {
                const NotificationModel = require('../models/notification');
                NotificationModel.getUnreadCount(req.user._id)
                    .then(count => {
                        res.locals.unreadNotifications = count;
                        next();
                    })
                    .catch(err => {
                        console.error('Error fetching notification count:', err);
                        res.locals.unreadNotifications = 0;
                        next();
                    });
            } else {
                next();
            }
        } catch (error) {
            // Token invalid or expired, clear it
            console.error('Authentication error:', error.message);
            res.clearCookie(cookieName);
            req.user = null;
            res.locals.user = null;
            next();
        }
    };
}

// Middleware to check if user is authenticated and redirect if not
const requireAuth = async (req, res, next) => {
    try {
        // Check for token-based authentication first
        if (req.user) {
            return next();
        }

        // Then check for session-based authentication
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                return next();
            }
        }

        // If neither authentication method is present, redirect to login
        return res.redirect('/auth/signin');
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

// Require seller role
const requireSeller = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/signin');
        }
        
        if (req.user.role !== 'seller') {
            return res.status(403).render('error', { 
                message: 'Access denied. Only sellers can perform this action.' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Seller middleware error:', error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

// Require buyer role
const requireBuyer = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/signin');
        }
        
        if (req.user.role !== 'buyer') {
            return res.status(403).render('error', { 
                message: 'Access denied. Only buyers can perform this action.' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Buyer middleware error:', error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

module.exports = {
    checkForAuthenticationCookie,
    requireAuth,
    requireSeller,
    requireBuyer
};