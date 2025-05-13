/**
 * Middleware to set request timeouts
 * Automatically terminates requests that take too long and sends an error response
 */
const timeout = (seconds) => {
  const milliseconds = seconds * 1000;
  
  return (req, res, next) => {
    // Set a timeout for the request
    const timeoutId = setTimeout(() => {
      // Check if the response has already been sent
      if (!res.headersSent) {
        return res.status(408).json({
          success: false,
          error: 'Request Timeout',
          message: `The request took longer than ${seconds} seconds to complete`
        });
      }
    }, milliseconds);
    
    // Clear the timeout when the response is sent
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });
    
    // Continue with the request
    next();
  };
};

module.exports = timeout;
