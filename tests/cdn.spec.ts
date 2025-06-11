import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/index';

describe('CDN File Retrieval', () => {
  const cdnDir = path.resolve(__dirname, '../src/cdn');

  // Ensure CDN directory exists
  if (!fs.existsSync(cdnDir)) {
    fs.mkdirSync(cdnDir, { recursive: true });
  }

  // Create a test file
  const testFilePath = path.join(cdnDir, 'test.txt');
  fs.writeFileSync(testFilePath, 'Test content');

  it('should retrieve an existing file', async () => {
    const response = await request(app).get('/cdn/test.txt');
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('Test content');
    expect(response.headers['content-type']).toContain('text/plain');
  });

  it('should return 404 for non-existent file', async () => {
    const response = await request(app).get('/cdn/nonexistent.txt');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'File not found' });
  });

  it('should prevent directory traversal', async () => {
    const response = await request(app).get('/cdn/../sensitive-file.txt');
    
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Access denied' });
  });

  it('should require a filename', async () => {
    const response = await request(app).get('/cdn/');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Filename is required' });
  });

  // Cleanup
  afterAll(() => {
    fs.unlinkSync(testFilePath);
  });
});