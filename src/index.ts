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

  // Prevent specific unsafe patterns first
  if (
    !filename || 
    filename.includes('../') || 
    filename.includes('..\\') || 
    filename.includes('/') || 
    filename.includes('\\') || 
    filename.startsWith('.') ||
    filename === ''
  ) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Prevent directory traversal and injection attacks
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

// Configure routes
app.get('/cdn/:filename', retrieveFile);
app.get('/cdn/', (req, res) => res.status(400).json({ error: 'Filename is required' }));

export default app;