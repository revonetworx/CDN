const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter middleware to prevent abuse and protect against DOS attacks
 * @param {Object} options - Configuration options for rate limiting
 * @param {number} options.windowMs - Time window for rate limiting in milliseconds (default: 15 minutes)
 * @param {number} options.max - Maximum number of requests allowed per IP in the time window (default: 100)
 * @returns {Function} Express middleware for rate limiting
 */
const createRateLimiter = (options = {}) => {
  const { 
    windowMs = 15 * 60 * 1000,  // 15 minutes
    max = 100  // 100 requests per windowMs
  } = options;

  const createOptions = {
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.'
    },
    // Optional: log rate limit events
    handler: (req, res, next, options) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).json(options.message);
    }
  };

  const rateLimiter = rateLimit(createOptions);
  
  // Expose createOptions for testing
  rateLimiter._createOptions = createOptions;
  
  return rateLimiter;
};

module.exports = createRateLimiter;