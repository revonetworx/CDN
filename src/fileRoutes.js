const express = require('express');
const fs = require('fs');
const path = require('path');

/**
 * Create a router for file retrieval
 * @param {string} cdnDirectory - Base directory for file storage
 * @returns {express.Router} Configured Express router
 */
function createFileRouter(cdnDirectory) {
  const router = express.Router();

  // Middleware to sanitize and validate file path
  const sanitizeFilePath = (req, res, next) => {
    const { filename } = req.params;

    // Prevent directory traversal by checking for suspicious patterns
    if (filename.includes('../') || filename.startsWith('/')) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Invalid file path' 
      });
    }

    // Sanitize filename and create full path
    const sanitizedFilename = path.basename(filename);
    const fullPath = path.join(cdnDirectory, sanitizedFilename);

    // Ensure file is within CDN directory
    const resolvedPath = path.resolve(fullPath);
    const basePath = path.resolve(cdnDirectory);

    if (!resolvedPath.startsWith(basePath)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Invalid file path' 
      });
    }

    req.filePath = resolvedPath;
    next();
  };

  // File retrieval route
  router.get('/:filename', sanitizeFilePath, (req, res) => {
    const { filePath } = req;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'File does not exist' 
      });
    }

    // Stream file for efficient delivery
    res.download(filePath, (err) => {
      if (err) {
        // Handle errors during file transmission
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Server Error', 
            message: 'Could not serve file' 
          });
        }
      }
    });
  });

  return router;
}

module.exports = { createFileRouter };