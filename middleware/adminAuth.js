// Middleware to check if user is authenticated and has admin role
const adminAuth = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.redirect('/blog_list');
    }
    
    // Check if user has admin role
    if (!req.user.role || req.user.role !== 'admin') {
        return res.redirect('/blog_list');
    }
    
    // User is authenticated and has admin role, proceed to next middleware
    next();
};

module.exports = adminAuth;