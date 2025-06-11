import path from 'path';

/**
 * Configuration for CDN file serving
 * @typedef {Object} CdnConfig
 * @property {string} rootDirectory - The root directory for CDN file serving
 * @property {string[]} allowedFileExtensions - File extensions allowed to be served
 */

/** @type {CdnConfig} */
const cdnConfig = {
  // Use an absolute path to the CDN directory
  rootDirectory: path.resolve(process.cwd(), 'cdn'),
  
  // Allowed file extensions for security
  allowedFileExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', 
    '.pdf', '.txt', '.csv', 
    '.mp4', '.mp3', 
    '.zip', '.tar.gz'
  ]
};

export default cdnConfig;