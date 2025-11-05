const express = require('express');
const { PropertyModel } = require('./models');
const geocodingService = require('./service/geocoding');

async function testCompleteWorkflow() {
    console.log('🧪 Testing Complete Geocoding Workflow\n');
    
    // Test 1: Geocoding Service
    console.log('1. Testing Geocoding Service...');
    try {
        const result = await geocodingService.getCoordinatesFromAddress('San Francisco, CA, USA');
        console.log('✅ Geocoding Service works');
        console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
        console.log(`   Formatted: ${result.formattedAddress}\n`);
    } catch (error) {
        console.log('❌ Geocoding Service failed:', error.message);
        return;
    }
    
    // Test 2: Property Model Integration
    console.log('2. Testing Property Model Methods...');
    try {
        // Check if the required methods exist
        const methods = [
            'addProperty',
            'getPropertyById', 
            'updatePropertyGeolocation'
        ];
        
        for (const method of methods) {
            if (typeof PropertyModel[method] === 'function') {
                console.log(`✅ ${method} method exists`);
            } else {
                console.log(`❌ ${method} method missing`);
            }
        }
        console.log('');
    } catch (error) {
        console.log('❌ Property Model test failed:', error.message);
    }
    
    // Test 3: Error Handling
    console.log('3. Testing Error Handling...');
    try {
        await geocodingService.getCoordinatesFromAddress('');
    } catch (error) {
        console.log('✅ Empty address error handling works');
    }
    
    try {
        await geocodingService.getCoordinatesFromAddress('INVALID_ADDRESS_THAT_SHOULD_NOT_EXIST_12345');
    } catch (error) {
        console.log('✅ Invalid address error handling works');
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Test property creation through the web interface');
    console.log('3. Check that properties are automatically geocoded');
    console.log('4. Use admin endpoints to geocode existing properties');
}

testCompleteWorkflow().catch(console.error);
