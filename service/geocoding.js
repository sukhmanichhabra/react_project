const axios = require('axios');

class GeocodingService {
    constructor() {
        // Using OpenCage Data API - you can also use Google Maps API, Mapbox, etc.
        // For now, I'll use Nominatim (OpenStreetMap) which is free but has rate limits
        this.baseURL = 'https://nominatim.openstreetmap.org/search';
    }

    /**
     * Get coordinates (latitude, longitude) from an address
     * @param {string} address - The address to geocode
     * @returns {Promise<{latitude: number, longitude: number, formattedAddress: string}>}
     */
    async getCoordinatesFromAddress(address) {
        try {
            if (!address || typeof address !== 'string' || address.trim() === '') {
                throw new Error('Invalid address provided');
            }

            const cleanAddress = address.trim();
            console.log(`Geocoding address: ${cleanAddress}`);

            // Make request to Nominatim API
            const response = await axios.get(this.baseURL, {
                params: {
                    q: cleanAddress,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'RealEstateApp/1.0' // Required by Nominatim
                },
                timeout: 10000 // 10 second timeout
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('Address not found. Please provide a more specific address.');
            }

            const result = response.data[0];
            
            if (!result.lat || !result.lon) {
                throw new Error('Could not determine coordinates for the provided address');
            }

            const coordinates = {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                formattedAddress: result.display_name || cleanAddress
            };

            console.log(`Geocoding successful: ${coordinates.latitude}, ${coordinates.longitude}`);
            return coordinates;

        } catch (error) {
            console.error('Geocoding error:', error.message);
            
            // If it's a network error or API error, provide a fallback
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to geocoding service. Please try again later.');
            }
            
            throw error;
        }
    }

    /**
     * Validate if coordinates are reasonable (within world bounds)
     * @param {number} latitude 
     * @param {number} longitude 
     * @returns {boolean}
     */
    validateCoordinates(latitude, longitude) {
        return (
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180
        );
    }

    /**
     * Alternative geocoding using Google Maps API (if you have an API key)
     * Uncomment and configure if you want to use Google Maps instead
     */
    /*
    async getCoordinatesFromAddressGoogle(address) {
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: address,
                    key: apiKey
                }
            });

            if (response.data.status !== 'OK' || !response.data.results.length) {
                throw new Error('Address not found');
            }

            const result = response.data.results[0];
            const location = result.geometry.location;

            return {
                latitude: location.lat,
                longitude: location.lng,
                formattedAddress: result.formatted_address
            };
        } catch (error) {
            console.error('Google Geocoding error:', error.message);
            throw error;
        }
    }
    */
}

module.exports = new GeocodingService();
