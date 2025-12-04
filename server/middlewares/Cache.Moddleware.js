import redis from 'redis';
// Create client (configure with your url if using cloud)
const client = redis.createClient(); 
client.connect().catch(console.error);

// Helper to generate consistent keys
const generateKey = (req) => {
  // Use the URL path + query params to make a unique key
  // e.g., "api/problems?page=1&topic=arrays"
  return `${req.baseUrl}${req.user.id}?${JSON.stringify(req.query)}`;
};

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // 1. Skip caching for non-GET requests (safety)
   

    const key = generateKey(req);

    try {
      // 2. Check Redis for data
      const cachedData = await client.get(key);

      if (cachedData) {
        // HIT: Send cached data immediately
        return res.json(JSON.parse(cachedData));
      }

      // MISS: We need to modify res.json to cache the data before sending it
      const originalJson = res.json;

      res.json = (body) => {
        // Save to Redis (EX = expire time in seconds)
        client.set(key, JSON.stringify(body), { EX: duration });
        
        // Send the response to the user
        originalJson.call(res, body);
      };

      next();
    } catch (err) {
      console.error("Redis error:", err);
      next(); // If cache fails, just continue normally
    }
  };
};

export { cacheMiddleware, client };