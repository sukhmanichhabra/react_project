const geocodingService = require('./service/geocoding');

async function testGeocoding() {
    console.log('Testing geocoding service...\n');
    
    const testAddresses = [
        "New York, NY, USA",
        "London, UK"
    ];
    
    for (const address of testAddresses) {
        try {
            console.log(`Testing address: "${address}"`);
            const result = await geocodingService.getCoordinatesFromAddress(address);
            console.log(`✅ Success: ${result.latitude}, ${result.longitude}`);
            console.log(`   Formatted: ${result.formattedAddress}`);
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
        console.log('---');
        
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

console.log('Starting geocoding test...');
testGeocoding().then(() => {
    console.log('Test completed');
}).catch(error => {
    console.error('Test failed:', error);
});
