import express from 'express';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

const app = express();
const CDN_DIR = path.resolve(__dirname, 'cdn');

/**
 * Retrieves a file from the CDN directory
 * @param req Express request object
 * @param res Express response object
 */
export function retrieveFile(req: express.Request, res: express.Response) {
  const { filename } = req.params;

  // Strict validation for filename
  if (!filename || filename === '' || filename === '/' || /[/\\]/.test(filename)) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  // Prevent directory traversal attacks
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(CDN_DIR, sanitizedFilename);

  // Ensure file is within CDN directory
  const normalizedCdnDir = path.normalize(CDN_DIR);
  const normalizedFilePath = path.normalize(filePath);

  if (!normalizedFilePath.startsWith(normalizedCdnDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Determine MIME type
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  // Stream file
  res.setHeader('Content-Type', mimeType);
  fs.createReadStream(filePath).pipe(res);
}

// Specific CDN file retrieval route
app.get('/cdn/:filename([^/]+)', retrieveFile);

export default app;