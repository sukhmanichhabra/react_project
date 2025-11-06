/**
 * Utility functions for handling image URLs
 * Supports both Cloudinary URLs and legacy local paths
 */

/**
 * Get the correct image URL for display
 * @param {string} imagePath - The image path from backend (Cloudinary URL or local path)
 * @param {string} fallback - Fallback image path (default: '/assets/default-property.jpg')
 * @returns {string} - The processed image URL
 */
export const getImageUrl = (imagePath, fallback = '/assets/default-property.jpg') => {
  // Return fallback if no path provided
  if (!imagePath) return fallback;
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's a relative path (legacy assets or local files)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Default fallback
  return fallback;
};

/**
 * Get profile image URL
 * @param {string} imagePath - The profile image path
 * @returns {string} - The processed image URL
 */
export const getProfileImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-avatar.png');
};

/**
 * Get property image URL
 * @param {string} imagePath - The property image path
 * @returns {string} - The processed image URL
 */
export const getPropertyImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/assets/property-1.jpg');
};

/**
 * Get blog image URL
 * @param {string} imagePath - The blog image path
 * @returns {string} - The processed image URL
 */
export const getBlogImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/assets/house.jpg');
};

/**
 * Get agent image URL
 * @param {string} imagePath - The agent image path
 * @returns {string} - The processed image URL
 */
export const getAgentImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-avatar.png');
};

/**
 * Handle image load error
 * @param {Event} e - The error event
 * @param {string} fallback - Fallback image path
 */
export const handleImageError = (e, fallback = '/assets/default-property.jpg') => {
  e.target.src = fallback;
};

/**
 * Check if the image is from Cloudinary
 * @param {string} imagePath - The image path to check
 * @returns {boolean} - True if from Cloudinary
 */
export const isCloudinaryImage = (imagePath) => {
  return imagePath && imagePath.includes('cloudinary.com');
};

/**
 * Check if the image is a local/legacy image
 * @param {string} imagePath - The image path to check
 * @returns {boolean} - True if local image
 */
export const isLocalImage = (imagePath) => {
  return imagePath && imagePath.startsWith('/') && !imagePath.startsWith('http');
};
