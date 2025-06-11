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

  it('should have correct default settings', () => {
    const rateLimiter = createRateLimiter();
    
    expect(rateLimiter.windowMs).toBe(15 * 60 * 1000);
    expect(rateLimiter.max).toBe(100);
  });
});