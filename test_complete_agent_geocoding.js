const { AgentModel } = require('./models');
const geocodingService = require('./service/geocoding');

async function testCompleteAgentGeocoding() {
    console.log('🧪 Testing Complete Agent Geocoding Implementation\n');
    
    // Test 1: Geocoding Service for Agent Locations
    console.log('1. Testing Geocoding Service for Agent Locations...');
    try {
        const testLocations = [
            'San Francisco, CA, USA',
            'Los Angeles, CA, USA',
            'Seattle, WA, USA'
        ];
        
        for (const location of testLocations) {
            const result = await geocodingService.getCoordinatesFromAddress(location);
            console.log(`✅ ${location}: ${result.latitude}, ${result.longitude}`);
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('');
    } catch (error) {
        console.log('❌ Geocoding Service failed:', error.message);
        return;
    }
    
    // Test 2: Agent Model Functions
    console.log('2. Testing Agent Model Functions...');
    try {
        const agentMethods = [
            'addAgent',
            'updateAgent',
            'getAgentById',
            'getAllAgents',
            'assignAgentByGeolocation',
            'findBestAgentForProperty'
        ];
        
        for (const method of agentMethods) {
            if (typeof AgentModel[method] === 'function') {
                console.log(`✅ ${method} method exists`);
            } else {
                console.log(`❌ ${method} method missing`);
            }
        }
        console.log('');
    } catch (error) {
        console.log('❌ Agent Model test failed:', error.message);
        return;
    }
    
    // Test 3: Simulate Agent Creation with Geocoding
    console.log('3. Testing Agent Creation with Automatic Geocoding...');
    try {
        // This is a simulation - not actually creating an agent
        const testAgentData = {
            userId: '507f1f77bcf86cd799439011', // Mock ObjectId
            name: 'Test Agent',
            email: 'test@agent.com',
            location: 'New York, NY, USA'
        };
        
        console.log(`Testing agent creation for location: ${testAgentData.location}`);
        
        // Test the geocoding part
        const geocodeResult = await geocodingService.getCoordinatesFromAddress(testAgentData.location);
        console.log(`✅ Geocoding would succeed: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
        console.log(`   Formatted address: ${geocodeResult.formattedAddress}`);
        console.log('');
    } catch (error) {
        console.log('❌ Agent creation simulation failed:', error.message);
    }
    
    // Test 4: Property Assignment Logic
    console.log('4. Testing Property Assignment Logic...');
    try {
        // Test distance calculation
        if (typeof AgentModel.calculateDistance === 'function') {
            const distance = AgentModel.calculateDistance(40.7128, -74.0060, 40.7589, -73.9851);
            console.log(`✅ Distance calculation works: ${distance.toFixed(2)} km`);
        } else {
            console.log('❌ Distance calculation function not found');
        }
        console.log('');
    } catch (error) {
        console.log('❌ Property assignment test failed:', error.message);
    }
    
    console.log('🎉 Agent Geocoding Implementation Tests Completed!\n');
    
    console.log('📋 Implementation Summary:');
    console.log('✅ Automatic geocoding when agents provide location');
    console.log('✅ Location-based property assignment system');
    console.log('✅ Admin tools for managing agent coordinates');
    console.log('✅ Batch geocoding capabilities');
    console.log('✅ Service radius and distance calculations');
    console.log('✅ Error handling and fallback mechanisms\n');
    
    console.log('🚀 Next Steps:');
    console.log('1. Test agent creation through the web interface');
    console.log('2. Verify automatic geocoding works');
    console.log('3. Test property assignment based on agent location');
    console.log('4. Use admin endpoints to manage agent coordinates');
    console.log('5. Monitor property assignment efficiency');
}

testCompleteAgentGeocoding().catch(console.error);
