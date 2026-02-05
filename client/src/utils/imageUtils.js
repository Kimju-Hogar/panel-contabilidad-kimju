import { IMAGE_BASE_URL } from '../config/constants';

/**
 * Constructs a full image URL from a path.
 * Handles various edge cases like missing slashes, existing absolute URLs, etc.
 * @param {string} path - The image path (e.g., '/uploads/img.jpg')
 * @returns {string} - The full URL (e.g., 'http://localhost:5000/uploads/img.jpg')
 */
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('blob:')) return path; // For local previews

    // Ensure path starts with / if not present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Ensure base url doesn't end with / if path starts with /
    const cleanBase = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;

    return `${cleanBase}${cleanPath}`;
};
