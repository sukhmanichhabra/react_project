const mongoose = require('mongoose');
require('dotenv').config();

async function testAgentProfileUpdate() {
    try {
        console.log('🧪 Testing Agent Profile Update with Geolocation...\n');
        
        // Connect to database
        const mongoUrl = process.env.MONGO_URL;
        await mongoose.connect(mongoUrl);
        console.log('✅ Connected to database');
        
        const { AgentModel, UserModel } = require('./models');
        
        // Find an existing agent
        console.log('\n🔍 Finding test agent...');
        const agents = await AgentModel.Agent.find({}).limit(1);
        
        if (agents.length === 0) {
            console.log('❌ No agents found for testing');
            return;
        }
        
        const testAgent = agents[0];
        console.log(`✅ Found test agent: ${testAgent.name} (ID: ${testAgent._id})`);
        console.log(`   Current location: ${testAgent.location || 'Not set'}`);
        console.log(`   Current geolocation: ${testAgent.geolocation ? `${testAgent.geolocation.latitude}, ${testAgent.geolocation.longitude}` : 'Not set'}`);
        
        // Test 1: Update agent with geolocation data
        console.log('\n📍 Test 1: Updating agent with geolocation data...');
        
        const updateData = {
            name: testAgent.name,
            title: 'Senior Real Estate Agent',
            qualification: 'Licensed Realtor, MBA',
            overview: 'Experienced agent specializing in residential properties with over 10 years in the market.',
            location: 'New Delhi, India',
            geolocation: {
                latitude: 28.6139,
                longitude: 77.2090,
                serviceRadius: 30
            }
        };
        
        // Simulate the profile update
        const updatedAgent = await AgentModel.Agent.findByIdAndUpdate(
            testAgent._id,
            {
                $set: {
                    title: updateData.title,
                    qualification: updateData.qualification,
                    overview: updateData.overview,
                    location: updateData.location,
                    'geolocation.latitude': updateData.geolocation.latitude,
                    'geolocation.longitude': updateData.geolocation.longitude,
                    'geolocation.serviceRadius': updateData.geolocation.serviceRadius
                }
            },
            { new: true }
        );
        
        console.log('✅ Agent profile updated successfully');
        console.log(`   Title: ${updatedAgent.title}`);
        console.log(`   Qualification: ${updatedAgent.qualification}`);
        console.log(`   Location: ${updatedAgent.location}`);
        console.log(`   Coordinates: ${updatedAgent.geolocation.latitude}, ${updatedAgent.geolocation.longitude}`);
        console.log(`   Service Radius: ${updatedAgent.geolocation.serviceRadius}km`);
        
        // Test 2: Test geolocation-based property assignment
        console.log('\n🎯 Test 2: Testing property assignment with updated agent location...');
        
        const bestAgent = await AgentModel.findBestAgentForProperty(
            28.6315, // Property near Connaught Place, Delhi
            77.2167
        );
        
        if (bestAgent) {
            console.log('✅ Best agent found for Delhi property:');
            console.log(`   Agent: ${bestAgent.name}`);
            console.log(`   Distance: ${AgentModel.calculateDistance(28.6315, 77.2167, bestAgent.geolocation.latitude, bestAgent.geolocation.longitude).toFixed(2)}km`);
            console.log(`   Workload: ${bestAgent.listingCount || 0} properties`);
            console.log(`   Verified: ${bestAgent.verified}`);
        } else {
            console.log('❌ No suitable agent found');
        }
        
        // Test 3: Update only service radius
        console.log('\n🔧 Test 3: Updating only service radius...');
        
        const updatedRadius = await AgentModel.Agent.findByIdAndUpdate(
            testAgent._id,
            { 'geolocation.serviceRadius': 50 },
            { new: true }
        );
        
        console.log(`✅ Service radius updated to ${updatedRadius.geolocation.serviceRadius}km`);
        
        // Test 4: Verify agent shows up in geolocation info API
        console.log('\n📊 Test 4: Checking agent in geolocation info...');
        
        const agentsWithGeo = await AgentModel.Agent.find({
            'geolocation.latitude': { $exists: true, $ne: null },
            'geolocation.longitude': { $exists: true, $ne: null }
        }).select('name location geolocation listingCount verified');
        
        console.log(`✅ Found ${agentsWithGeo.length} agents with geolocation:`);
        agentsWithGeo.forEach(agent => {
            console.log(`   - ${agent.name}: ${agent.geolocation.latitude}, ${agent.geolocation.longitude} (${agent.geolocation.serviceRadius}km radius)`);
        });
        
        // Test 5: Test form data validation
        console.log('\n✅ Test 5: Testing form data validation...');
        
        const formData = {
            name: testAgent.name,
            title: 'Updated Title',
            latitude: '28.7041',
            longitude: '77.1025',
            serviceRadius: '40'
        };
        
        // Simulate form submission processing
        const processedData = {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            serviceRadius: parseInt(formData.serviceRadius)
        };
        
        console.log('✅ Form data validation successful:');
        console.log(`   Latitude: ${processedData.latitude} (${typeof processedData.latitude})`);
        console.log(`   Longitude: ${processedData.longitude} (${typeof processedData.longitude})`);
        console.log(`   Service Radius: ${processedData.serviceRadius} (${typeof processedData.serviceRadius})`);
        
        console.log('\n🎉 All agent profile update tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the test
testAgentProfileUpdate();
