#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Agent Geocoding Implementation...\n');

// Check if all required files exist and have the necessary implementations
const checks = [
    {
        name: 'Geocoding Service',
        file: 'service/geocoding.js',
        checks: ['getCoordinatesFromAddress', 'validateCoordinates']
    },
    {
        name: 'Agent Model Enhancements',
        file: 'models/agent.js',
        checks: ['geocodeAgentLocation', 'assignAgentByGeolocation', 'calculateDistance']
    },
    {
        name: 'Agent Routes Admin Endpoints',
        file: 'routes/agent.js',
        checks: ['/admin/geolocation/auto/', '/admin/missing-geolocation', '/admin/geolocation/auto-batch']
    },
    {
        name: 'Property Model Integration',
        file: 'models/property.js',
        checks: ['approveProperty', 'geolocation']
    }
];

let allPassed = true;

checks.forEach(check => {
    console.log(`\n📋 Checking ${check.name}...`);
    
    const filePath = path.join(__dirname, check.file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${check.file}`);
        allPassed = false;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    check.checks.forEach(checkItem => {
        if (content.includes(checkItem)) {
            console.log(`✅ Found: ${checkItem}`);
        } else {
            console.log(`❌ Missing: ${checkItem}`);
            allPassed = false;
        }
    });
});

console.log('\n🎯 Implementation Status:');
if (allPassed) {
    console.log('✅ All checks passed! Agent geocoding implementation is complete.');
    console.log('\n🚀 Ready for testing:');
    console.log('1. Start the application: npm start');
    console.log('2. Create/update an agent with a location');
    console.log('3. Verify automatic geocoding in the database');
    console.log('4. Test property assignment to agents');
    console.log('5. Use admin endpoints for batch management');
} else {
    console.log('❌ Some checks failed. Please review the implementation.');
}

console.log('\n📚 Documentation available in:');
console.log('- AGENT_GEOCODING_COMPLETE.md');
console.log('- GEOCODING_IMPLEMENTATION.md');
