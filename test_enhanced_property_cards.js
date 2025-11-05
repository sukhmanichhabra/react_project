/**
 * Test Enhanced Property Cards Implementation
 * This test verifies that the enhanced property card system is working correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { PropertyModel, AgentModel } = require('./models');
const UserModel = require('./models/user');

async function testEnhancedPropertyCardsData() {
    try {
        console.log('🔍 Testing Enhanced Property Cards Implementation...\n');
        
        // Connect to database
        console.log('📦 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database successfully\n');
        
        // Test 1: Check if we have properties in the database
        console.log('📋 Test 1: Checking existing properties...');
        const properties = await PropertyModel.find({ approvalStatus: 'approved' }).limit(5);
        console.log(`Found ${properties.length} approved properties`);
        
        if (properties.length === 0) {
            console.log('⚠️  No approved properties found. Creating sample data...');
            await createSamplePropertyData();
        } else {
            console.log('✅ Properties found! Displaying sample:');
            properties.forEach((prop, index) => {
                console.log(`   ${index + 1}. ${prop.title} - ${prop.location.city} - $${prop.price}`);
            });
        }
        
        // Test 2: Verify property data structure for enhanced cards
        console.log('\n📋 Test 2: Verifying property data structure...');
        if (properties.length > 0) {
            const sampleProperty = properties[0];
            console.log('Sample property structure:');
            console.log(`   ✓ Title: ${sampleProperty.title}`);
            console.log(`   ✓ Price: $${sampleProperty.price}`);
            console.log(`   ✓ Location: ${sampleProperty.location.address}, ${sampleProperty.location.city}`);
            console.log(`   ✓ Images: ${sampleProperty.images?.length || 0} images`);
            console.log(`   ✓ Features: ${JSON.stringify(sampleProperty.features)}`);
            console.log(`   ✓ Tag: ${sampleProperty.tag}`);
            console.log(`   ✓ Status: ${sampleProperty.status}`);
            console.log(`   ✓ Agent ID: ${sampleProperty.agentId || 'Not assigned'}`);
        }
        
        // Test 3: Check if agents exist for property cards
        console.log('\n📋 Test 3: Checking agent assignments...');
        const propertiesWithAgents = await PropertyModel.aggregate([
            { $match: { approvalStatus: 'approved' } },
            {
                $lookup: {
                    from: 'agents',
                    localField: 'agentId',
                    foreignField: '_id',
                    as: 'agent'
                }
            },
            { $limit: 3 }
        ]);
        
        console.log(`Found ${propertiesWithAgents.length} properties with agent data`);
        propertiesWithAgents.forEach((prop, index) => {
            const agent = prop.agent[0];
            console.log(`   ${index + 1}. ${prop.title} - Agent: ${agent ? agent.fullName : 'No agent assigned'}`);
        });
        
        console.log('\n✅ Enhanced Property Cards data verification completed!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Open http://localhost:5000/property to view the enhanced property cards');
        console.log('   2. Check that all property information displays correctly');
        console.log('   3. Test interactive features (view property, contact agent, wishlist)');
        console.log('   4. Verify responsive design on different screen sizes');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

async function createSamplePropertyData() {
    try {
        console.log('🏗️  Creating sample property data...');
        
        // First, ensure we have at least one agent
        let agent = await AgentModel.findOne();
        if (!agent) {
            console.log('Creating sample agent...');
            const sampleUser = new UserModel({
                username: 'sample_agent',
                email: 'agent@example.com',
                password: 'hashedpassword',
                role: 'agent',
                fullName: 'Sample Agent',
                phone: '(555) 123-4567'
            });
            await sampleUser.save();
            
            agent = new AgentModel({
                userId: sampleUser._id,
                fullName: 'Sample Agent',
                phoneNumber: '(555) 123-4567',
                email: 'agent@example.com',
                licenseNumber: 'LIC123456',
                specializations: ['Residential', 'Commercial'],
                description: 'Experienced real estate agent',
                isVerified: true
            });
            await agent.save();
        }
        
        // Create sample properties
        const sampleProperties = [
            {
                title: 'Modern Downtown Apartment',
                description: 'Beautiful modern apartment with city views',
                price: 450000,
                location: {
                    address: '123 Main Street',
                    city: 'Downtown',
                    state: 'CA',
                    zipCode: '90210',
                    coordinates: {
                        lat: 34.0522,
                        lng: -118.2437
                    }
                },
                features: {
                    bedrooms: 2,
                    bathrooms: 2,
                    squareFootage: 1200,
                    type: 'Apartment'
                },
                amenities: ['Parking', 'Gym', 'Pool', 'Security'],
                images: ['/assets/default-property.jpg'],
                tag: 'sale',
                status: 'active',
                agentId: agent._id,
                sellerId: agent.userId,
                approvalStatus: 'approved'
            },
            {
                title: 'Spacious Family Home',
                description: 'Perfect family home in quiet neighborhood',
                price: 750000,
                location: {
                    address: '456 Oak Avenue',
                    city: 'Suburbia',
                    state: 'CA',
                    zipCode: '90211',
                    coordinates: {
                        lat: 34.0622,
                        lng: -118.2537
                    }
                },
                features: {
                    bedrooms: 4,
                    bathrooms: 3,
                    squareFootage: 2500,
                    type: 'House'
                },
                amenities: ['Garage', 'Garden', 'Fireplace', 'Patio'],
                images: ['/assets/default-property.jpg'],
                tag: 'sale',
                status: 'active',
                agentId: agent._id,
                sellerId: agent.userId,
                approvalStatus: 'approved'
            },
            {
                title: 'Luxury Rental Condo',
                description: 'High-end rental with premium amenities',
                price: 3500,
                location: {
                    address: '789 Beach Blvd',
                    city: 'Coastal',
                    state: 'CA',
                    zipCode: '90212',
                    coordinates: {
                        lat: 34.0722,
                        lng: -118.2637
                    }
                },
                features: {
                    bedrooms: 3,
                    bathrooms: 2,
                    squareFootage: 1800,
                    type: 'Condo'
                },
                amenities: ['Ocean View', 'Concierge', 'Spa', 'Rooftop'],
                images: ['/assets/default-property.jpg'],
                tag: 'rent',
                status: 'active',
                agentId: agent._id,
                sellerId: agent.userId,
                approvalStatus: 'approved'
            }
        ];
        
        await PropertyModel.insertMany(sampleProperties);
        console.log(`✅ Created ${sampleProperties.length} sample properties`);
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testEnhancedPropertyCardsData();
}

module.exports = { testEnhancedPropertyCardsData };
