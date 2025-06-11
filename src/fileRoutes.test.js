import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createFileRouter } from './fileRoutes';

describe('File Routes', () => {
  let app;
  let tempDir;
  let testFile;

  beforeEach(() => {
    // Create a temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdn-test-'));
    
    // Create a test file
    testFile = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFile, 'Test content');

    // Create Express app with file router
    app = express();
    app.use('/files', createFileRouter(tempDir));
  });

  it('should retrieve an existing file', async () => {
    const response = await request(app)
      .get('/files/test.txt')
      .expect(200);

    expect(response.text).toBe('Test content');
  });

  it('should prevent directory traversal with ../', async () => {
    const response = await request(app)
      .get('/files/../etc/passwd')
      .expect(403);

    expect(response.body).toEqual({
      error: 'Access denied',
      message: 'Invalid file path'
    });
  });

  it('should return 404 for non-existent file', async () => {
    const response = await request(app)
      .get('/files/nonexistent.txt')
      .expect(404);

    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'File does not exist'
    });
  });
});