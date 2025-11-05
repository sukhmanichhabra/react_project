// Enhanced Property Card JavaScript Functions
// Handles interactions for the enhanced property cards

// View property details
function viewProperty(propertyId) {
    if (!propertyId) {
        console.error('Property ID is required');
        return;
    }
    
    // Add loading state to button
    const button = event.target.closest('.action-btn');
    if (button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Loading...</span>';
        button.disabled = true;
        
        // Restore button after navigation
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
        }, 1000);
    }
    
    // Navigate to property detail page
    window.location.href = `/property/${propertyId}`;
}

// Contact agent
function contactAgent(agentId) {
    if (!agentId || agentId === '#') {
        // Show message if no agent assigned
        showNotification('No agent assigned to this property yet.', 'warning');
        return;
    }
    
    // Add loading state to button
    const button = event.target.closest('.action-btn');
    if (button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Connecting...</span>';
        button.disabled = true;
        
        // Restore button after navigation
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
        }, 1000);
    }
    
    // Navigate to agent contact page or open contact modal
    window.location.href = `/agent/${agentId}`;
}

// Toggle wishlist
function toggleWishlist(propertyId) {
    if (!propertyId) {
        console.error('Property ID is required');
        return;
    }
    
    const button = event.target.closest('.action-btn.wishlist');
    const icon = button.querySelector('i');
    
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        showNotification('Please log in to add properties to your wishlist.', 'info');
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 2000);
        return;
    }
    
    // Toggle wishlist state
    const isCurrentlyInWishlist = button.classList.contains('active');
    
    // Add loading state
    icon.className = 'fas fa-spinner fa-spin';
    button.disabled = true;
    
    // Make API call to toggle wishlist
    fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update button state
            if (data.inWishlist) {
                button.classList.add('active');
                icon.className = 'fas fa-heart';
                showNotification('Added to wishlist!', 'success');
            } else {
                button.classList.remove('active');
                icon.className = 'far fa-heart';
                showNotification('Removed from wishlist!', 'info');
            }
        } else {
            throw new Error(data.message || 'Failed to update wishlist');
        }
    })
    .catch(error => {
        console.error('Error toggling wishlist:', error);
        showNotification('Failed to update wishlist. Please try again.', 'error');
        
        // Restore original state
        icon.className = isCurrentlyInWishlist ? 'fas fa-heart' : 'far fa-heart';
        if (isCurrentlyInWishlist) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    })
    .finally(() => {
        button.disabled = false;
    });
}

// Utility function to check if user is logged in
function isUserLoggedIn() {
    // Check if user data exists (this depends on your auth implementation)
    return document.body.dataset.userId || localStorage.getItem('userId') || false;
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.property-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `property-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Get notification color based on type
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#48bb78';
        case 'error': return '#f56565';
        case 'warning': return '#ed8936';
        default: return '#4299e1';
    }
}

// Property card animation observer
function initializePropertyCardAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${Array.from(entry.target.parentElement.children).indexOf(entry.target) * 0.1}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all property cards
    document.querySelectorAll('.enhanced-property-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize property card interactions
function initializePropertyCards() {
    // Initialize animations
    initializePropertyCardAnimations();
    
    // Add CSS animations
    if (!document.getElementById('property-card-animations')) {
        const style = document.createElement('style');
        style.id = 'property-card-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                margin-left: auto;
                opacity: 0.8;
                transition: opacity 0.3s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .enhanced-property-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .enhanced-property-card.visible {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize wishlist states (check which properties are in user's wishlist)
    initializeWishlistStates();
}

// Initialize wishlist states
function initializeWishlistStates() {
    if (!isUserLoggedIn()) return;
    
    fetch('/api/wishlist')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.wishlist) {
                data.wishlist.forEach(propertyId => {
                    const wishlistButton = document.querySelector(`[onclick*="${propertyId}"].wishlist`);
                    if (wishlistButton) {
                        wishlistButton.classList.add('active');
                        const icon = wishlistButton.querySelector('i');
                        if (icon) {
                            icon.className = 'fas fa-heart';
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading wishlist states:', error);
        });
}

// Property card loading state
function setPropertyCardLoading(propertyId, isLoading) {
    const propertyCard = document.querySelector(`[data-property-id="${propertyId}"] .enhanced-property-card`);
    if (propertyCard) {
        if (isLoading) {
            propertyCard.classList.add('loading');
        } else {
            propertyCard.classList.remove('loading');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all elements to be rendered
    setTimeout(initializePropertyCards, 100);
});

// Export functions for external use
window.viewProperty = viewProperty;
window.contactAgent = contactAgent;
window.toggleWishlist = toggleWishlist;
window.showNotification = showNotification;
