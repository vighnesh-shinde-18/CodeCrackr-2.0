import Redis from "ioredis";
import { config } from "dotenv";

config();

// FIX: Use explicit object configuration instead of a string
// This allows us to set 'family: 4' to force IPv4
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1', 
    port: process.env.REDIS_PORT || 6379,
    family: 4, // ⚠️ Forces IPv4. Fixes the Node.js localhost/::1 error
    retryStrategy: (times) => {
        // Optional: reconnect after 2 seconds if connection is lost
        return Math.min(times * 50, 2000);
    }
});

redis.on("connect", () => {
    console.log("✅ Redis Connected Successfully");
});

redis.on("error", (err) => {
    // We modify the error log to be less verbose if it's just a connection refused
    if (err.code === 'ECONNREFUSED') {
        console.error("❌ Redis Connection Refused. Is the server running?");
    } else {
        console.error("❌ Redis Connection Error:", err);
    }
});

export default redis;