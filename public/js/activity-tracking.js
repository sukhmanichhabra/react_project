/**
 * Activity Tracking JavaScript
 * Handles tracking user interactions with advertisements, property comparisons, etc.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize advertisement click tracking
    initAdClickTracking();
    
    // Initialize other tracking functionality as needed
});

/**
 * Initialize advertisement click tracking
 */
function initAdClickTracking() {
    // Find all advertisement links with data-ad-id attribute
    const adLinks = document.querySelectorAll('a[data-ad-id]');
    
    adLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get advertisement ID from data attribute
            const adId = this.getAttribute('data-ad-id');
            
            // Get destination URL
            const destination = this.href;
            
            // Track the click
            trackAdClick(adId, destination);
            
            // Don't prevent default - let the user navigate to the destination
        });
    });
}

/**
 * Track advertisement click
 * @param {string} adId - The advertisement ID
 * @param {string} destination - The destination URL
 */
function trackAdClick(adId, destination) {
    // Make AJAX request to track the click
    fetch(`/advertising/click/${adId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination: destination
        })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error tracking advertisement click:', error);
    });
}

/**
 * Track a generic user activity
 * @param {string} actionType - The type of action (e.g., 'search', 'filter', 'compare')
 * @param {string} targetType - The type of target (e.g., 'property', 'agent')
 * @param {string} targetId - The ID of the target
 * @param {string} targetName - The name of the target
 * @param {Object} metadata - Additional metadata about the action
 */
function trackActivity(actionType, targetType, targetId, targetName, metadata = {}) {
    fetch('/activity/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            actionType: actionType,
            targetType: targetType,
            targetId: targetId,
            targetName: targetName,
            metadata: metadata,
            duration: null // Can be set for timed activities
        })
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error logging activity:', error);
    });
}

// Export functions for use in other files
window.ActivityTracking = {
    trackAdClick: trackAdClick,
    trackActivity: trackActivity
}; 