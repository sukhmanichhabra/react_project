document.addEventListener('DOMContentLoaded', function() {
    // Initialize property status filter
    const statusFilterContainer = document.querySelector('.filter-sidebar');
    
    // Only add the filter if we're on the property list page and the sidebar exists
    if (statusFilterContainer) {
        // Create approval status filter section
        const approvalStatusSection = document.createElement('div');
        approvalStatusSection.className = 'approval-status-filter';
        approvalStatusSection.innerHTML = `
            <h3>Approval Status</h3>
            <select id="approvalStatusFilter">
                <option value="all">All Properties</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
            </select>
        `;
        
        // Insert the approval status filter after the first h3 element
        const firstH3 = statusFilterContainer.querySelector('h3');
        if (firstH3 && firstH3.parentNode) {
            firstH3.parentNode.insertBefore(approvalStatusSection, firstH3.nextSibling);
        } else {
            // If no h3 found, insert at the beginning of the container
            statusFilterContainer.insertBefore(approvalStatusSection, statusFilterContainer.firstChild);
        }
        
        // Add event listener to the approval status filter
        const approvalStatusFilter = document.getElementById('approvalStatusFilter');
        if (approvalStatusFilter) {
            approvalStatusFilter.addEventListener('change', function() {
                filterPropertiesByApprovalStatus();
            });
        }
    }
    
    // Function to filter properties by approval status
    function filterPropertiesByApprovalStatus() {
        const selectedStatus = document.getElementById('approvalStatusFilter').value;
        const propertyCards = document.querySelectorAll('.property-card');
        
        propertyCards.forEach(card => {
            // Get the approval status from the data attribute
            const approvalStatus = card.dataset.approvalStatus || 'approved'; // Default to approved for existing properties
            
            if (selectedStatus === 'all' || approvalStatus === selectedStatus) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Add approval status badges to property cards
    function addApprovalStatusBadges() {
        const propertyCards = document.querySelectorAll('.property-card');
        
        propertyCards.forEach(card => {
            const approvalStatus = card.dataset.approvalStatus;
            
            // Only add badges for pending or rejected properties
            if (approvalStatus === 'pending' || approvalStatus === 'rejected') {
                const badgeContainer = document.createElement('div');
                badgeContainer.className = `approval-status-badge ${approvalStatus}`;
                badgeContainer.innerHTML = `
                    <i class="fas ${approvalStatus === 'pending' ? 'fa-clock' : 'fa-times-circle'}"></i>
                    ${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                `;
                
                // Add the badge to the property card
                const figure = card.querySelector('figure');
                if (figure) {
                    figure.appendChild(badgeContainer);
                }
            }
        });
    }
    
    // Call the function to add approval status badges
    addApprovalStatusBadges();
});