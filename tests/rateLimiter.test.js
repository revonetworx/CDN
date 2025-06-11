import { describe, it, expect } from 'vitest';
import createRateLimiter from '../src/middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  it('should create a rate limiter with default options', () => {
    const rateLimiter = createRateLimiter();
    
    expect(rateLimiter).toBeDefined();
    expect(typeof rateLimiter).toBe('function');
  });

  it('should allow custom configuration', () => {
    const customOptions = {
      windowMs: 5 * 60 * 1000,  // 5 minutes
      max: 50  // 50 requests per window
    };
    
    const rateLimiter = createRateLimiter(customOptions);
    
    expect(rateLimiter).toBeDefined();
    expect(typeof rateLimiter).toBe('function');
  });

  it('should create rate limiter with default window and max values', () => {
    const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
    const DEFAULT_MAX_REQUESTS = 100;
    
    const createOptions = createRateLimiter()._createOptions;
    
    expect(createOptions.windowMs).toBe(DEFAULT_WINDOW_MS);
    expect(createOptions.max).toBe(DEFAULT_MAX_REQUESTS);
  });
});