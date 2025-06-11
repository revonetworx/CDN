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

    // Strict check for directory traversal
    const hasDangerousPath = () => {
      const normalized = path.normalize(filename);
      const resolved = path.resolve(path.join(cdnDirectory, normalized));
      const relative = path.relative(cdnDirectory, resolved);
      
      return (
        normalized !== filename || 
        filename.includes('../') || 
        filename.startsWith('/') || 
        relative.startsWith('..') || 
        relative.includes('../')
      );
    };

    if (hasDangerousPath()) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Invalid file path' 
      });
    }

    // Sanitize filename 
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