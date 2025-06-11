const path = require('path');
const cdnConfig = require('../config/cdn.config');

/**
 * Middleware to validate and restrict file access to CDN directory
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If file access is not permitted
 */
function cdnDirectoryMiddleware(req, res, next) {
  try {
    // Get the requested file path from the URL parameters
    const requestedFilePath = req.params[0] || '';

    // Construct the full file path
    const fullFilePath = path.resolve(cdnConfig.rootDirectory, requestedFilePath);

    // Normalize paths to prevent directory traversal
    const normalizedRequestPath = path.normalize(fullFilePath);
    const normalizedRootPath = path.normalize(cdnConfig.rootDirectory);

    // Check if the requested file is within the CDN root directory
    if (!normalizedRequestPath.startsWith(normalizedRootPath)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'File is outside the permitted CDN directory' 
      });
    }

    // Check file extension
    const fileExtension = path.extname(normalizedRequestPath).toLowerCase();
    if (!cdnConfig.allowedFileExtensions.includes(fileExtension)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'File type not allowed' 
      });
    }

    // Add the validated file path to the request for use in subsequent middleware
    req.cdnFilePath = normalizedRequestPath;
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Error processing file request' 
    });
  }
}

module.exports = cdnDirectoryMiddleware;