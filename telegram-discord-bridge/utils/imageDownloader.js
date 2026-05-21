import axios from 'axios';
import logger from './logger.js';

/**
 * Downloads an image from a given URL.
 * @param {string} url - The URL of the image.
 * @returns {Promise<{buffer: Buffer, mimeType: string}>}
 */
export async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const mimeType = response.headers['content-type'];
        return { buffer, mimeType };
    } catch (error) {
        logger.error(`Error downloading image from ${url}: ${error.message}`);
        throw error;
    }
}
