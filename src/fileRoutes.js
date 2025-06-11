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

    // Comprehensive check for directory traversal attempts
    const hasDangerousPath = () => {
      // Check for known directory traversal patterns
      const dangerousPatterns = [
        /\.\./,   // Parent directory reference
        /^\/+/,   // Starts with forward slash
        /\\+/,    // Contains backslash
        /\//,     // Contains forward slash
        /\\/      // Contains backslash
      ];

      // Test against dangerous patterns
      const hasUnsafePattern = dangerousPatterns.some(pattern => pattern.test(filename));
      
      // Additional checks
      const isAbsolutePath = path.isAbsolute(filename);
      const wouldEscapeCdn = path.resolve(path.join(cdnDirectory, filename)) !== 
                              path.resolve(path.join(cdnDirectory, path.basename(filename)));

      return hasUnsafePattern || isAbsolutePath || wouldEscapeCdn;
    };

    if (hasDangerousPath()) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Invalid file path' 
      });
    }

    // Sanitize filename and create full path
    const sanitizedFilename = path.basename(filename);
    const fullPath = path.join(cdnDirectory, sanitizedFilename);

    req.filePath = fullPath;
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