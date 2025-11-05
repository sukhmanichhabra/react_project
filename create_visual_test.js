/**
 * Simple Enhanced Property Cards Visual Test
 * Creates a static HTML test page to verify the enhanced property card styling
 */

const fs = require('fs');
const path = require('path');

function createVisualTest() {
    console.log('🎨 Creating Enhanced Property Cards Visual Test...\n');
    
    // Sample property data for testing
    const sampleProperties = [
        {
            title: 'Modern Downtown Apartment',
            price: 450000,
            location: { address: '123 Main Street', city: 'Downtown', state: 'CA' },
            features: { bedrooms: 2, bathrooms: 2, squareFootage: 1200, type: 'Apartment' },
            amenities: ['Parking', 'Gym', 'Pool', 'Security'],
            images: ['/assets/default-property.jpg'],
            tag: 'sale',
            status: 'active',
            agent: { fullName: 'John Doe', phoneNumber: '(555) 123-4567', email: 'john@example.com' }
        },
        {
            title: 'Spacious Family Home',
            price: 750000,
            location: { address: '456 Oak Avenue', city: 'Suburbia', state: 'CA' },
            features: { bedrooms: 4, bathrooms: 3, squareFootage: 2500, type: 'House' },
            amenities: ['Garage', 'Garden', 'Fireplace', 'Patio'],
            images: ['/assets/default-property.jpg'],
            tag: 'sale',
            status: 'active',
            agent: { fullName: 'Jane Smith', phoneNumber: '(555) 987-6543', email: 'jane@example.com' }
        },
        {
            title: 'Luxury Rental Condo',
            price: 3500,
            location: { address: '789 Beach Blvd', city: 'Coastal', state: 'CA' },
            features: { bedrooms: 3, bathrooms: 2, squareFootage: 1800, type: 'Condo' },
            amenities: ['Ocean View', 'Concierge', 'Spa', 'Rooftop'],
            images: ['/assets/default-property.jpg'],
            tag: 'rent',
            status: 'active',
            agent: { fullName: 'Mike Johnson', phoneNumber: '(555) 456-7890', email: 'mike@example.com' }
        }
    ];
    
    // Generate property cards HTML
    let propertyCardsHTML = '';
    sampleProperties.forEach(property => {
        propertyCardsHTML += generatePropertyCard(property);
    });
    
    // Create complete HTML test page
    const testHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Property Cards Test</title>
    <link rel="stylesheet" href="/css/enhanced-property-card.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .test-header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .test-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .test-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .property-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .property-item {
            list-style: none;
        }
        .test-info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            color: white;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .test-checklist {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .check-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .check-item i {
            color: #4ade80;
        }
    </style>
</head>
<body>
    <div class="test-header">
        <h1>🏠 Enhanced Property Cards Test</h1>
        <p>Visual verification of the systematic property card design</p>
    </div>
    
    <div class="test-info">
        <h3>✨ Test Features</h3>
        <div class="test-checklist">
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Property Images</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Location Display</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Bed/Bath Info</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Square Footage</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Price Display</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Agent Information</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Responsive Design</span>
            </div>
            <div class="check-item">
                <i class="fas fa-check"></i>
                <span>Interactive Buttons</span>
            </div>
        </div>
    </div>
    
    <div class="property-grid">
        ${propertyCardsHTML}
    </div>
    
    <script src="/js/enhanced-property-card.js"></script>
    <script>
        // Add some test notifications
        console.log('🎨 Enhanced Property Cards Test Loaded Successfully!');
        
        // Test the notification system
        setTimeout(() => {
            if (window.showNotification) {
                showNotification('Enhanced Property Cards are ready for testing!', 'success');
            }
        }, 1000);
    </script>
</body>
</html>`;

    // Write the test file
    const testFilePath = path.join(__dirname, 'public', 'enhanced-property-cards-test.html');
    fs.writeFileSync(testFilePath, testHTML);
    
    console.log('✅ Visual test page created successfully!');
    console.log(`📁 Test file: ${testFilePath}`);
    console.log('\n🌐 Access the test page at:');
    console.log('   http://localhost:5000/enhanced-property-cards-test.html');
    console.log('\n🎯 Test Checklist:');
    console.log('   ✓ Property images display correctly');
    console.log('   ✓ All property information is visible and well-organized');
    console.log('   ✓ Price, location, and features are clearly displayed');
    console.log('   ✓ Agent information shows properly');
    console.log('   ✓ Buttons are interactive and styled correctly');
    console.log('   ✓ Cards are responsive on different screen sizes');
    console.log('   ✓ Hover effects and animations work smoothly');
}

function generatePropertyCard(property) {
    return `
        <li class="property-item">
            <div class="enhanced-property-card" 
                 data-property-type="${property.features.type}"
                 data-tag="${property.tag}"
                 data-amenities="${property.amenities.join(',')}"
                 data-status="${property.status}">
                
                <!-- Property Image Section -->
                <div class="property-image-container">
                    <div class="property-badge ${property.tag}">
                        ${property.tag === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                    </div>
                    
                    <!-- Image with overlay actions -->
                    <div class="property-image-wrapper">
                        <img src="${property.images[0]}" 
                             alt="${property.title}" 
                             class="property-image"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/400x250/f0f0f0/666?text=Property+Image';">
                        
                        <!-- Quick Action Buttons -->
                        <div class="property-quick-actions">
                            <button class="quick-action-btn wishlist-btn" onclick="toggleWishlist(this)" title="Add to Wishlist">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="quick-action-btn share-btn" title="Share Property">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Property Content Section -->
                <div class="property-content">
                    <!-- Price and Title -->
                    <div class="property-header">
                        <h3 class="property-title">${property.title}</h3>
                        <div class="property-price">
                            $${property.price.toLocaleString()}${property.tag === 'rent' ? '/month' : ''}
                        </div>
                    </div>
                    
                    <!-- Location -->
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${property.location.address}, ${property.location.city}, ${property.location.state}</span>
                    </div>
                    
                    <!-- Property Features Grid -->
                    <div class="property-features">
                        <div class="feature-item">
                            <i class="fas fa-bed"></i>
                            <div class="feature-details">
                                <span class="feature-value">${property.features.bedrooms}</span>
                                <span class="feature-label">Bedrooms</span>
                            </div>
                        </div>
                        
                        <div class="feature-item">
                            <i class="fas fa-bath"></i>
                            <div class="feature-details">
                                <span class="feature-value">${property.features.bathrooms}</span>
                                <span class="feature-label">Bathrooms</span>
                            </div>
                        </div>
                        
                        <div class="feature-item">
                            <i class="fas fa-ruler-combined"></i>
                            <div class="feature-details">
                                <span class="feature-value">${property.features.squareFootage.toLocaleString()}</span>
                                <span class="feature-label">Sq Ft</span>
                            </div>
                        </div>
                        
                        <div class="feature-item">
                            <i class="fas fa-home"></i>
                            <div class="feature-details">
                                <span class="feature-value">${property.features.type}</span>
                                <span class="feature-label">Type</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Amenities -->
                    <div class="property-amenities">
                        ${property.amenities.slice(0, 3).map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                        ${property.amenities.length > 3 ? `<span class="amenity-more">+${property.amenities.length - 3} more</span>` : ''}
                    </div>
                    
                    <!-- Agent Information -->
                    <div class="agent-info">
                        <div class="agent-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="agent-details">
                            <div class="agent-name">${property.agent.fullName}</div>
                            <div class="agent-contact">
                                <i class="fas fa-phone"></i>
                                <span>${property.agent.phoneNumber}</span>
                            </div>
                        </div>
                        <button class="contact-agent-btn" onclick="contactAgent('${property.agent.email}', '${property.agent.fullName}')">
                            Contact
                        </button>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="property-actions">
                        <button class="btn btn-primary view-property-btn" onclick="viewProperty('test-${property.title.replace(/\s+/g, '-').toLowerCase()}')">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button class="btn btn-secondary schedule-visit-btn">
                            <i class="fas fa-calendar-alt"></i>
                            Schedule Visit
                        </button>
                    </div>
                </div>
            </div>
        </li>
    `;
}

// Run the visual test creation
if (require.main === module) {
    createVisualTest();
}

module.exports = { createVisualTest };
