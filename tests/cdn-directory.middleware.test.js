import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import cdnDirectoryMiddleware from '../src/middleware/cdn-directory.middleware';

describe('CDN Directory Middleware', () => {
  const createMockRequest = (filePath) => ({
    params: { 0: filePath },
    cdnFilePath: null
  });

  const createMockResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  });

  const nextMock = vi.fn();

  it('should allow access to files within the CDN directory', () => {
    const req = createMockRequest('valid-file.txt');
    const res = createMockResponse();

    cdnDirectoryMiddleware(req, res, nextMock);

    expect(nextMock).toHaveBeenCalled();
    expect(req.cdnFilePath).toBeTruthy();
  });

  it('should block access to files outside the CDN directory', () => {
    const req = createMockRequest('../outside-directory.txt');
    const res = createMockResponse();

    cdnDirectoryMiddleware(req, res, nextMock);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Access denied',
        message: 'File is outside the permitted CDN directory'
      })
    );
  });

  it('should block files with disallowed extensions', () => {
    const req = createMockRequest('malicious.exe');
    const res = createMockResponse();

    cdnDirectoryMiddleware(req, res, nextMock);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Forbidden',
        message: 'File type not allowed'
      })
    );
  });
});